use std::fmt;
use std::time::{Duration, Instant};

use tracing::field::{Field, Visit};
use tracing::span::Attributes;
use tracing::{debug, Event, Id, Subscriber};
use tracing_subscriber::layer::{Context, SubscriberExt};
use tracing_subscriber::registry::{LookupSpan, Registry};
use tracing_subscriber::Layer;

/// Forked from https://crates.io/crates/tracing-span-tree. Still exploring what this should do.
pub struct SpanTree {
    program_start: Instant,
}

impl SpanTree {
    pub fn new() -> Self {
        SpanTree {
            program_start: Instant::now(),
        }
    }

    /// Set as a global subscriber
    pub fn enable(self) {
        // Ignore everything except our own code. hyper and reqwest are very spammy.
        // TODO Filter more carefully -- anything >= INFO from other crates is probably fine
        let subscriber = Registry::default().with(self.with_filter(
            tracing_subscriber::filter::filter_fn(|metadata| metadata.target().starts_with("spc")),
        ));
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
        let mut span = Self {
            start: Instant::now(),
            kvs: Vec::new(),
            children: Vec::new(),
        };
        attrs.record(&mut span);
        span
    }
    fn into_node(self, name: &'static str, fields: String) -> Node {
        Node {
            name,
            fields,
            count: 1,
            duration: self.start.elapsed(),
            children: self.children,
        }
    }
}

impl Visit for Data {
    fn record_debug(&mut self, field: &Field, value: &dyn fmt::Debug) {
        self.kvs.push((field.name(), format!("{:?}", value)));
    }
}

struct ScrapeOneMessage {
    value: Option<String>,
}

// TODO Probably just grab "message" and ignore anything else
impl Visit for ScrapeOneMessage {
    fn record_debug(&mut self, _: &Field, value: &dyn fmt::Debug) {
        if let Some(ref prev) = self.value {
            panic!("Two values for an event: {} and {:?}", prev, value);
        }
        self.value = Some(format!("{:?}", value));
    }
}

impl<S> Layer<S> for SpanTree
where
    S: Subscriber + for<'span> LookupSpan<'span> + fmt::Debug,
{
    fn on_new_span(&self, attrs: &Attributes, id: &Id, ctx: Context<S>) {
        let span = ctx.span(id).unwrap();

        let data = Data::new(attrs);
        span.extensions_mut().insert(data);
    }

    fn on_event(&self, event: &Event<'_>, ctx: Context<S>) {
        let mut scrape = ScrapeOneMessage { value: None };
        event.record(&mut scrape);
        let parent = ctx
            .current_span()
            .metadata()
            .map(|s| s.name())
            .unwrap_or("???");
        println!(
            "[{:3.2?}] [{}] {}",
            self.program_start.elapsed(),
            parent,
            scrape.value.unwrap()
        );
    }

    fn on_close(&self, id: Id, ctx: Context<S>) {
        let span = ctx.span(&id).unwrap();
        let mut data = span.extensions_mut().remove::<Data>().unwrap();
        let fields = match data.kvs.pop() {
            Some(pair) => pair.1,
            None => String::new(),
        };
        let node = data.into_node(span.name(), fields);

        match span.parent().map(|span_ref| span_ref.id()) {
            Some(parent_id) => {
                let parent_span = ctx.span(&parent_id).unwrap();
                parent_span
                    .extensions_mut()
                    .get_mut::<Data>()
                    .unwrap()
                    .children
                    .push(node);
            }
            None => node.print(),
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
        println!();
        self.go(0)
    }

    fn go(&self, level: usize) {
        let bold = "\u{001b}[1m";
        let reset = "\u{001b}[0m";

        let duration = format!("{:3.2?}", self.duration);
        let count = if self.count > 1 {
            self.count.to_string()
        } else {
            String::new()
        };
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
}
