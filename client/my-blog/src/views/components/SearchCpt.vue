<style scoped>
.input {
  max-width: 190px;
}

.label {
  position: relative;
  display: block;
  width: 280px;
  border-radius: 10px;
  border: 2px solid #5e5757;
  padding: 15px 8px 15px 10px;
  text-align: left;
  box-shadow:
    20px 20px 60px #3853c7,
    -20px -20px 60px #19ad88;
}

.shortcut {
  position: absolute;
  top: 50%;
  right: -3%;
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
  color: #c5c5c5;
  background-color: #5e5757;
  padding: 0.3em;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.search_bar {
  background-color: transparent;
  border: none;
  outline: none;
  font-size: 16px;
  color: rgb(111, 115, 119);
}
</style>

<template>
  <label class="label" style="margin: 0 auto;">
    <div class="shortcut" style="cursor: pointer;">⌘K</div>
    <input type="text" class="search_bar" placeholder="搜索你要的文章..." />
  </label>
</template>
