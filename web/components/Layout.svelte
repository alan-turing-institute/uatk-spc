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
    width: 420px;
    height: 100vh;
    overflow: scroll;
  }
  .main {
    width: calc(100% - 425px);
  }
</style>
