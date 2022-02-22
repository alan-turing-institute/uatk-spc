//! Consumer of `tracing` data, which prints a hierarchical profile.
//!
//! Based on https://github.com/davidbarsky/tracing-tree, but does less, while
//! actually printing timings for spans by default.
//!
//! Usage:
//!
//! ```rust
//! tracing_span_tree::span_tree()
//!     .aggregate(true)
//!     .enable();
//! ```
//!
//! Example output:
//!
//! ```text
//! 8.37ms           top_level
//!   1.09ms           middle
//!     1.06ms           leaf
//!   1.06ms           middle
//!   3.12ms           middle
//!     1.06ms           leaf
//!   3.06ms           middle
//! ```
//!
//! Same data, but with `.aggregate(true)`:
//!
//! ```text
//! 8.39ms           top_level
//!  8.35ms    4      middle
//!    2.13ms    2      leaf
//! ```

use std::{
    fmt, mem,
    time::{Duration, Instant},
};

use tracing::{
    debug,
    field::{Field, Visit},
    span::Attributes,
    Event, Id, Subscriber,
};
use tracing_subscriber::{
    layer::Context,
    prelude::*,
    registry::{LookupSpan, Registry},
    Layer,
};

pub fn span_tree() -> SpanTree {
    SpanTree::default()
}

#[derive(Default)]
pub struct SpanTree {
    aggregate: bool,
}

impl SpanTree {
    /// Merge identical sibling spans together.
    pub fn aggregate(self, yes: bool) -> SpanTree {
        SpanTree { aggregate: yes, ..self }
    }
    /// Set as a global subscriber
    pub fn enable(self) {
        let subscriber = Registry::default().with(self);
        tracing::subscriber::set_global_default(subscriber)
            .unwrap_or_else(|_| debug!("Global subscriber is already set"));
    }
}

struct Data {
    start: Instant,
    kvs: Vec<(&'static str, String)>,
    children: Vec<Node>,
}

impl Data {
    fn new(attrs: &Attributes<'_>) -> Self {
        let mut span = Self { start: Instant::now(), kvs: Vec::new(), children: Vec::new() };
        attrs.record(&mut span);
        span
    }
    fn into_node(self, name: &'static str, fields: String) -> Node {
        Node { name, fields, count: 1, duration: self.start.elapsed(), children: self.children }
    }
}

impl Visit for Data {
    fn record_debug(&mut self, field: &Field, value: &dyn fmt::Debug) {
        self.kvs.push((field.name(), format!("{:?}", value)));
    }
}

impl<S> Layer<S> for SpanTree
where
    S: Subscriber + for<'span> LookupSpan<'span> + fmt::Debug,
{
    fn new_span(&self, attrs: &Attributes, id: &Id, ctx: Context<S>) {
        let span = ctx.span(id).unwrap();

        let data = Data::new(attrs);
        span.extensions_mut().insert(data);
    }

    fn on_event(&self, _event: &Event<'_>, _ctx: Context<S>) {}

    fn on_close(&self, id: Id, ctx: Context<S>) {
        let span = ctx.span(&id).unwrap();
        let data = span.extensions_mut().remove::<Data>().unwrap();
        //let fields = format!("{:?}", span.fields());
        let fields = format!("{:?}", data.kvs);
        let mut node = data.into_node(span.name(), fields);

        match span.parent_id() {
            Some(parent_id) => {
                let parent_span = ctx.span(parent_id).unwrap();
                parent_span.extensions_mut().get_mut::<Data>().unwrap().children.push(node);
            }
            None => {
                if self.aggregate {
                    node.aggregate()
                }
                node.print()
            }
        }
    }
}

#[derive(Default)]
struct Node {
    name: &'static str,
    fields: String,
    count: u32,
    duration: Duration,
    children: Vec<Node>,
}

impl Node {
    fn print(&self) {
        self.go(0)
    }
    fn go(&self, level: usize) {
        let bold = "\u{001b}[1m";
        let reset = "\u{001b}[0m";

        let duration = format!("{:3.2?}", self.duration);
        let count = if self.count > 1 { self.count.to_string() } else { String::new() };
        eprintln!(
            "{:width$}  {:<9} {:<6} {bold}{} {}{reset}",
            "",
            duration,
            count,
            self.name,
            self.fields,
            bold = bold,
            reset = reset,
            width = level * 2
        );
        for child in &self.children {
            child.go(level + 1)
        }
        if level == 0 {
            eprintln!()
        }
    }

    fn aggregate(&mut self) {
        if self.children.is_empty() {
            return;
        }

        self.children.sort_by_key(|it| it.name);
        let mut idx = 0;
        for i in 1..self.children.len() {
            if self.children[idx].name == self.children[i].name {
                let child = mem::take(&mut self.children[i]);
                self.children[idx].duration += child.duration;
                self.children[idx].count += child.count;
                self.children[idx].children.extend(child.children);
            } else {
                idx += 1;
                assert!(idx <= i);
                self.children.swap(idx, i);
            }
        }
        self.children.truncate(idx + 1);
        for child in &mut self.children {
            child.aggregate()
        }
    }
}
