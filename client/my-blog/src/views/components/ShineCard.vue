<style scoped>
.e-card {
  background: transparent;
  box-shadow: 0px 8px 28px -9px rgba(0, 0, 0, 0.45);
  position: relative;
  /* flex: 1; */
  width: 620px;
  height: 330px;
  border-radius: 16px;
  overflow: hidden;
  transition: all 1s;
}

.e-card:hover {
  scale: 1.04;
  /* color: #000; */
}

.wave {
  position: absolute;
  width: 1300px;
  height: 700px;
  opacity: 0.6;
  left: 0;
  top: 0;
  margin-left: -50%;
  margin-top: -70%;
  background: linear-gradient(744deg, #af40ff, #5b42f3 60%, #00ddeb);
}

.icon {
  width: 3em;
  margin-top: -1em;
  padding-bottom: 1em;
}

.infotop {
  text-align: center;
  font-size: 20px;
  position: absolute;
  top: 5.6em;
  left: 0;
  right: 0;
  color: rgb(255, 255, 255);
  font-weight: 600;
}

.name {
  font-size: 14px;
  font-weight: 100;
  position: relative;
  top: 1em;
  text-transform: lowercase;
}

.wave:nth-child(2),
.wave:nth-child(3) {
  top: 210px;
}

.playing .wave {
  border-radius: 40%;
  animation: wave 3000ms infinite linear;
}

.wave {
  border-radius: 40%;
  animation: wave 55s infinite linear;
}

.playing .wave:nth-child(2) {
  animation-duration: 4000ms;
}

.wave:nth-child(2) {
  animation-duration: 50s;
}

.playing .wave:nth-child(3) {
  animation-duration: 5000ms;
}

.wave:nth-child(3) {
  animation-duration: 45s;
}

@keyframes wave {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>

<template>
  <div class="e-card playing">
    <div class="image"></div>

    <div class="wave"></div>
    <div class="wave"></div>
    <div class="wave"></div>


    <div class="infotop" style="cursor: pointer;">
      <div>
        <h1>
          <slot name="title"></slot>
        </h1>
      </div>
      <div class="name">
        <slot name="content"></slot>
      </div>
    </div>
  </div>
</template>
