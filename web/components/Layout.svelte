<div class="left">
  <slot name="left" />
</div>
<div class="main">
  <slot name="main" />
</div>

<style>
  div {
    float: left;
    padding: 0px;
  }

  .left {
    width: 395px;
    height: 100vh;
    overflow: scroll;
  }
  .main {
    /* TODO 75% wraps?! */
    width: calc(100% - 395px);
  }
</style>
