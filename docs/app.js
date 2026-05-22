(() => {
  const canvas = document.querySelector("[data-fizz-canvas]");
  const flavorButtons = Array.from(document.querySelectorAll("[data-flavor]"));
  const bottleLabel = document.querySelector("[data-bottle-label]");
  const fizzRange = document.querySelector("[data-fizz-range]");
  const burstButton = document.querySelector("[data-burst]");

  const flavors = {
    citrus: {
      label: "Citrus Beam",
      main: "#f5c84b",
      accent: "#41c7b9",
      bubble: "#08766d"
    },
    berry: {
      label: "Berry Flicker",
      main: "#b7558b",
      accent: "#f2a1c7",
      bubble: "#7f2e62"
    },
    mint: {
      label: "Mint Current",
      main: "#6dbb77",
      accent: "#bfe8df",
      bubble: "#2d8061"
    },
    peach: {
      label: "Peach Spark",
      main: "#ef775f",
      accent: "#f8d36f",
      bubble: "#b84f3d"
    }
  };

  let activeFlavor = flavors.citrus;
  let fizzLevel = Number(fizzRange?.value || 3);
  let triggerBurst = () => {};

  const setFlavor = (key) => {
    activeFlavor = flavors[key] || flavors.citrus;
    document.documentElement.style.setProperty("--flavor-main", activeFlavor.main);
    document.documentElement.style.setProperty("--flavor-accent", activeFlavor.accent);

    if (bottleLabel) {
      bottleLabel.textContent = activeFlavor.label;
    }

    flavorButtons.forEach((button) => {
      const isActive = button.dataset.flavor === key;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  };

  flavorButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setFlavor(button.dataset.flavor);
      triggerBurst(14);
    });
  });

  fizzRange?.addEventListener("input", () => {
    fizzLevel = Number(fizzRange.value);
  });

  burstButton?.addEventListener("click", () => triggerBurst(26));

  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d");
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = { x: 0, y: 0, active: false };
  const ball = { x: 160, y: 120, vx: 2.7, vy: 2.1, radius: 34 };
  const bubbles = [];
  let width = 0;
  let height = 0;
  let animationFrame = 0;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.max(1, Math.floor(width * ratio));
    canvas.height = Math.max(1, Math.floor(height * ratio));
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    ball.x = Math.min(Math.max(ball.x, ball.radius), width - ball.radius);
    ball.y = Math.min(Math.max(ball.y, ball.radius), height - ball.radius);
  };

  const addBubble = (x, y, power = 1) => {
    bubbles.push({
      x,
      y,
      radius: 3 + Math.random() * 8,
      vx: (Math.random() - 0.5) * 1.8 * power,
      vy: (-1.4 - Math.random() * 2.5) * power,
      life: 58 + Math.random() * 38,
      maxLife: 96
    });
  };

  function addBubbleBurst(count) {
    const startX = pointer.active ? pointer.x : ball.x;
    const startY = pointer.active ? pointer.y : ball.y;

    for (let index = 0; index < count; index += 1) {
      addBubble(startX + (Math.random() - 0.5) * 54, startY + (Math.random() - 0.5) * 42, 1.6);
    }

    ball.vx += (Math.random() - 0.5) * 2.2;
    ball.vy -= 2.4;
  }

  triggerBurst = addBubbleBurst;

  const drawBackground = () => {
    context.clearRect(0, 0, width, height);
    context.fillStyle = "rgba(249, 247, 239, 0.08)";
    context.fillRect(0, 0, width, height);
  };

  const drawBall = () => {
    const shineX = ball.x - ball.radius * 0.35;
    const shineY = ball.y - ball.radius * 0.42;
    const gradient = context.createRadialGradient(shineX, shineY, 4, ball.x, ball.y, ball.radius * 1.2);

    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.24, activeFlavor.main);
    gradient.addColorStop(1, activeFlavor.bubble);

    context.beginPath();
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    context.fillStyle = gradient;
    context.fill();
    context.lineWidth = 3;
    context.strokeStyle = "rgba(255, 255, 255, 0.72)";
    context.stroke();
  };

  const drawBubbles = () => {
    bubbles.forEach((bubble) => {
      const alpha = Math.max(0, bubble.life / bubble.maxLife);
      context.beginPath();
      context.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
      context.strokeStyle = `rgba(8, 118, 109, ${0.12 + alpha * 0.45})`;
      context.lineWidth = 1.5;
      context.stroke();
    });
  };

  const tick = () => {
    const speed = 0.78 + fizzLevel * 0.08;
    const gravity = 0.035 + fizzLevel * 0.006;

    if (pointer.active) {
      ball.vx += (pointer.x - ball.x) * 0.0009;
      ball.vy += (pointer.y - ball.y) * 0.0009;
    }

    ball.vy += gravity;
    ball.x += ball.vx * speed;
    ball.y += ball.vy * speed;

    if (ball.x < ball.radius || ball.x > width - ball.radius) {
      ball.vx *= -0.92;
      ball.x = Math.min(Math.max(ball.x, ball.radius), width - ball.radius);
      addBubble(ball.x, ball.y, 1.2);
    }

    if (ball.y < ball.radius || ball.y > height - ball.radius) {
      ball.vy *= -0.9;
      ball.y = Math.min(Math.max(ball.y, ball.radius), height - ball.radius);
      addBubble(ball.x, ball.y, 1.2);
    }

    if (Math.random() < 0.08 + fizzLevel * 0.025) {
      addBubble(ball.x + (Math.random() - 0.5) * 36, ball.y + ball.radius * 0.5, 1);
    }

    for (let index = bubbles.length - 1; index >= 0; index -= 1) {
      const bubble = bubbles[index];
      bubble.x += bubble.vx;
      bubble.y += bubble.vy;
      bubble.vy -= 0.006;
      bubble.life -= 1.2;

      if (bubble.life <= 0 || bubble.y < -20) {
        bubbles.splice(index, 1);
      }
    }

    drawBackground();
    drawBubbles();
    drawBall();
    animationFrame = window.requestAnimationFrame(tick);
  };

  const handlePointer = (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.active = true;
  };

  canvas.addEventListener("pointermove", handlePointer);
  canvas.addEventListener("pointerdown", (event) => {
    handlePointer(event);
    addBubbleBurst(20);
  });
  canvas.addEventListener("pointerleave", () => {
    pointer.active = false;
  });

  window.addEventListener("resize", resize);

  resize();
  setFlavor("citrus");

  if (mediaQuery.matches) {
    drawBackground();
    drawBall();
    return;
  }

  tick();

  window.addEventListener("pagehide", () => {
    window.cancelAnimationFrame(animationFrame);
  });
})();
