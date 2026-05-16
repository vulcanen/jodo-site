/* Jodo 官网 FX 层：光标聚光（CSS 渐变）+ 点击涟漪 + 粒子 + 磁性按钮。
 *
 * 设计原则（与产品"极简"一致）：
 * - 全部走 white / opacity，不引新颜色。
 * - 粒子最多 12 颗、漂移极慢、似有似无。
 * - prefers-reduced-motion 完全关闭动效（噪点静态保留）。
 * - 触屏设备跳过光标聚光和磁性按钮，但保留点击涟漪。
 * - 标签隐藏时暂停 requestAnimationFrame，省电。
 *
 * 启用粒子：在 <body> 上加 data-fx-particles="on"。
 * 启用磁性：在元素上加 data-fx-magnetic。
 */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasHover = window.matchMedia('(hover: hover)').matches;

  // ===== 点击涟漪 =====
  if (!reduced) {
    document.addEventListener(
      'pointerdown',
      (e) => {
        if (e.button && e.button !== 0) return;
        const r = document.createElement('div');
        r.className = 'fx-ripple';
        r.style.left = e.clientX + 'px';
        r.style.top = e.clientY + 'px';
        document.body.appendChild(r);
        // 与 CSS 动画 600ms 对齐，稍微多 100ms 给 transition 收尾。
        setTimeout(() => r.remove(), 700);
      },
      { passive: true }
    );
  }

  // ===== 粒子层 =====
  const particlesOn = document.body.dataset.fxParticles === 'on' && !reduced;
  if (particlesOn) {
    const canvas = document.createElement('canvas');
    canvas.className = 'fx-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let w = 0;
    let h = 0;
    let dpr = 1;
    let particles = [];
    const mouse = { x: -1e4, y: -1e4, active: false };

    const resize = () => {
      // DPR 上限 2，避免 4K 屏渲染开销翻倍且观感无差。
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawn = () => {
      // 按视口面积自适应：每 30k 像素²一颗粒子（平均间距 ~173px）。
      // - floor 16：移动端竖屏 (~300k 像素²) 至少保证 16 颗
      // - cap 100：4K 屏 (~8M 像素²) 不让粒子失控（GPU 没压力，纯视觉控制）
      // - 同密度在不同屏幕上视觉一致（粒子间距大致不变）
      // 参考刻度：iPhone (300k)=16, iPad (1.4M)=47, 1440x900 (1.3M)=43,
      //          1080p (2.07M)=69, 2K (3.69M)=100, 4K (8.3M)=100
      const count = Math.max(16, Math.min(100, Math.round((w * h) / 30000)));
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          r: 1 + Math.random() * 1.4,
          a: 0.06 + Math.random() * 0.1,
          burst: false,
          life: 1,
        });
      }
    };

    // 点击爆发：4 颗短命粒子四向飞散，800ms 内淡出。
    const burst = (x, y) => {
      for (let i = 0; i < 4; i++) {
        const angle = (Math.PI * 2 * i) / 4 + Math.random() * 0.6 - 0.3;
        const speed = 1.5 + Math.random() * 1.8;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: 1.4,
          a: 0.5,
          burst: true,
          life: 1,
        });
      }
    };

    let running = true;
    const tick = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // 鼠标排斥（只对环境粒子；爆发粒子按惯性走）
        if (!p.burst && mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          // 影响半径 110px。
          if (d2 < 12100 && d2 > 0) {
            const d = Math.sqrt(d2);
            const force = (1 - d / 110) * 0.28;
            p.vx += (dx / d) * force;
            p.vy += (dy / d) * force;
          }
        }

        p.vx *= 0.97;
        p.vy *= 0.97;
        p.x += p.vx;
        p.y += p.vy;

        if (p.burst) {
          p.life -= 0.022;
          if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
          }
        } else {
          // 环境粒子飘出屏幕从另一侧回来，永不消失。
          if (p.x < -10) p.x = w + 10;
          if (p.x > w + 10) p.x = -10;
          if (p.y < -10) p.y = h + 10;
          if (p.y > h + 10) p.y = -10;
          // 速度过低就轻推一下，避免完全停下。
          const speed = Math.hypot(p.vx, p.vy);
          if (speed < 0.04) {
            p.vx += (Math.random() - 0.5) * 0.06;
            p.vy += (Math.random() - 0.5) * 0.06;
          }
        }

        const alpha = p.burst ? p.a * p.life : p.a;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
      }
      requestAnimationFrame(tick);
    };

    window.addEventListener('resize', () => {
      resize();
      spawn();
    });

    if (hasHover) {
      window.addEventListener(
        'pointermove',
        (e) => {
          if (e.pointerType !== 'mouse') return;
          mouse.x = e.clientX;
          mouse.y = e.clientY;
          mouse.active = true;
        },
        { passive: true }
      );
      window.addEventListener('blur', () => {
        mouse.active = false;
      });
    }

    // 点击触发爆发（任何设备都生效）。
    window.addEventListener(
      'click',
      (e) => {
        burst(e.clientX, e.clientY);
      },
      { passive: true }
    );

    // 标签切到后台暂停 RAF，省电。回前台续上。
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        running = false;
      } else if (!running) {
        running = true;
        tick();
      }
    });

    resize();
    spawn();
    tick();
  }

  // ===== 磁性按钮 =====
  if (hasHover && !reduced) {
    document.querySelectorAll('[data-fx-magnetic]').forEach((el) => {
      let raf = null;
      let tx = 0;
      let ty = 0;

      el.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse') return;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        // 0.18 倍偏移：鼠标移得越偏按钮"被拽"得越多，但最多偏移 ~r.width*0.09。
        tx = (e.clientX - cx) * 0.18;
        ty = (e.clientY - cy) * 0.18;
        if (!raf) {
          raf = requestAnimationFrame(() => {
            el.style.transform = `translate(${tx}px, ${ty}px)`;
            raf = null;
          });
        }
      });

      el.addEventListener('pointerleave', () => {
        if (raf) {
          cancelAnimationFrame(raf);
          raf = null;
        }
        // 弹回 0,0 时用 transition 让"撒手"看起来有弹性。
        el.style.transition = 'transform 320ms cubic-bezier(0.25, 0.8, 0.3, 1)';
        el.style.transform = 'translate(0, 0)';
        setTimeout(() => {
          el.style.transition = '';
        }, 320);
      });
    });
  }
})();
