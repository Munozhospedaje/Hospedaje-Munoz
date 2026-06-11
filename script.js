/**
 * HOSPEDAJE MUÑOZ — script.js
 * Funcionalidades:
 *  1. Navbar: toggle móvil + sombra al hacer scroll
 *  2. Scroll Reveal: animación de aparición progresiva
 *  3. Habitaciones: botones de tarjetas pre-seleccionan habitación en el form
 *  4. Experiencias opcionales: mostrar/ocultar campos adicionales al marcar checkbox
 *  5. Formulario de reserva: validación básica + generación de mensaje WhatsApp
 *  6. Fecha mínima de los inputs de fecha = hoy
 */

/* ─────────────────────────────────────────
   1. NAVBAR — toggle móvil y clase scrolled
───────────────────────────────────────── */
(function initNavbar() {
  const toggle   = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const navbar   = document.getElementById('navbar');

  // Abrir / cerrar menú en móvil
  toggle.addEventListener('click', function () {
    navLinks.classList.toggle('open');
    const isOpen = navLinks.classList.contains('open');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  // Cerrar menú al hacer clic en un enlace
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
    });
  });

  // Sombra al hacer scroll (ya la tiene, pero podemos reforzarla)
  window.addEventListener('scroll', function () {
    if (window.scrollY > 10) {
      navbar.style.boxShadow = '0 4px 24px rgba(46,156,156,.18)';
    } else {
      navbar.style.boxShadow = '';
    }
  }, { passive: true });
})();


/* ─────────────────────────────────────────
   2. SCROLL REVEAL
───────────────────────────────────────── */
(function initScrollReveal() {
  // Añadir clase .reveal a todos los elementos candidatos
  const targets = document.querySelectorAll(
    '.room-card, .service-item, .exp-card, .testimonial-card, .section-header, .location-detail'
  );

  targets.forEach(function (el) {
    el.classList.add('reveal');
  });

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // solo animar una vez
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach(function (el) { observer.observe(el); });
})();


/* ─────────────────────────────────────────
   3. HABITACIONES — pre-seleccionar en form
───────────────────────────────────────── */
(function initRoomButtons() {
  // Botones con atributo data-room en las tarjetas de habitación
  document.querySelectorAll('[data-room]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      const roomName = btn.getAttribute('data-room');
      const select   = document.getElementById('habitacion');
      if (select && roomName) {
        // Buscar la opción que contiene el nombre de la habitación
        Array.from(select.options).forEach(function (option) {
          if (option.value.startsWith(roomName)) {
            select.value = option.value;
          }
        });
      }
      // El href="#reserva" del enlace hace el scroll; no necesitamos e.preventDefault()
    });
  });
})();


/* ─────────────────────────────────────────
   4. EXPERIENCIAS — mostrar/ocultar detalles
───────────────────────────────────────── */
(function initExperienceToggles() {
  // Hay 5 experiencias; cada checkbox tiene un div de detalles con id details-expN
  for (var i = 1; i <= 5; i++) {
    (function (num) {
      const checkbox = document.querySelector('[name="exp' + num + '"]');
      const details  = document.getElementById('details-exp' + num);
      if (!checkbox || !details) return;

      checkbox.addEventListener('change', function () {
        if (checkbox.checked) {
          details.style.display = 'block';
          // Animar suave
          details.style.opacity = '0';
          details.style.transform = 'translateY(-8px)';
          requestAnimationFrame(function () {
            details.style.transition = 'opacity .3s ease, transform .3s ease';
            details.style.opacity = '1';
            details.style.transform = 'translateY(0)';
          });
        } else {
          details.style.display = 'none';
          // Limpiar valores al desmarcar
          details.querySelectorAll('input').forEach(function (inp) { inp.value = ''; });
        }
      });
    })(i);
  }
})();


/* ─────────────────────────────────────────
   5. FORMULARIO — validación + WhatsApp
───────────────────────────────────────── */
(function initForm() {
  const form        = document.getElementById('reservaForm');
  const WA_NUMBER   = '51945087266';

  // Establecer fecha mínima hoy para todos los inputs date
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm   = String(hoy.getMonth() + 1).padStart(2, '0');
  const dd   = String(hoy.getDate()).padStart(2, '0');
  const todayStr = yyyy + '-' + mm + '-' + dd;

  document.querySelectorAll('input[type="date"]').forEach(function (inp) {
    inp.setAttribute('min', todayStr);
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // ── Validación de campos obligatorios ──
    const nombre     = form.nombre.value.trim();
    const telefono   = form.telefono.value.trim();
    const habitacion = form.habitacion.value;
    const huespedes  = form.huespedes.value;
    const checkin    = form.checkin.value;
    const checkout   = form.checkout.value;
    const llegada    = form.llegada.value;

    if (!nombre || !telefono || !habitacion || !huespedes || !checkin || !checkout || !llegada) {
      alert('Por favor completa todos los campos obligatorios (marcados con *).');
      return;
    }

    // Validar que checkout > checkin
    if (checkin >= checkout) {
      alert('La fecha de salida debe ser posterior a la fecha de ingreso.');
      return;
    }

    // ── Calcular número de noches ──
    const msPerDay = 1000 * 60 * 60 * 24;
    const dateIn   = new Date(checkin  + 'T00:00:00');
    const dateOut  = new Date(checkout + 'T00:00:00');
    const noches   = Math.round((dateOut - dateIn) / msPerDay);

    // ── Formatear fechas para mostrar ──
    function formatFecha(str) {
      if (!str) return '—';
      const parts = str.split('-');
      return parts[2] + '/' + parts[1] + '/' + parts[0];
    }

    // ── Recopilar experiencias seleccionadas ──
    var experienciasTexto = '';
    var expNames = [
      'City Tour Ica + Buggies y Sandboarding',
      'Tour Paracas + Islas Ballestas',
      'Paseo en Cuatrimotos',
      'Cañón de los Perdidos',
      'Tour Terrestre Nasca'
    ];

    for (var i = 1; i <= 5; i++) {
      var check = form['exp' + i];
      if (check && check.checked) {
        var fecha   = form['exp' + i + '_fecha']   ? form['exp' + i + '_fecha'].value   : '';
        var personas = form['exp' + i + '_personas'] ? form['exp' + i + '_personas'].value : '';
        experienciasTexto += '\n   • ' + expNames[i - 1];
        if (fecha)    experienciasTexto += ' | Fecha: ' + formatFecha(fecha);
        if (personas) experienciasTexto += ' | Personas: ' + personas;
      }
    }
    if (!experienciasTexto) experienciasTexto = '\n   (Ninguna seleccionada)';

    // ── Observaciones ──
    var observaciones = form.observaciones.value.trim() || '(Sin observaciones)';

    // ── Construir mensaje ──
    var mensaje =
      '🏨 *SOLICITUD DE RESERVA — HOSPEDAJE MUÑOZ*\n' +
      '━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      '👤 *Datos del huésped*\n' +
      '   • Nombre: ' + nombre + '\n' +
      '   • Teléfono: ' + telefono + '\n\n' +
      '🛏️ *Reserva*\n' +
      '   • Habitación: ' + habitacion + '\n' +
      '   • Huéspedes: ' + huespedes + '\n' +
      '   • Check-in: ' + formatFecha(checkin) + ' (desde 1:00 p.m.)\n' +
      '   • Check-out: ' + formatFecha(checkout) + ' (hasta 11:00 a.m.)\n' +
      '   • Noches: ' + noches + '\n' +
      '   • Hora de llegada aprox.: ' + llegada + '\n\n' +
      '🌄 *Experiencias opcionales*' + experienciasTexto + '\n\n' +
      '📝 *Observaciones*\n' +
      '   ' + observaciones + '\n\n' +
      '━━━━━━━━━━━━━━━━━━━━━━\n' +
      '📲 Enviado desde: gentlevins.com';

    // ── Abrir WhatsApp ──
    var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(mensaje);
    window.open(url, '_blank');
  });
})();


/* ─────────────────────────────────────────
   6. SMOOTH ANCHOR SCROLL (fallback para
      navegadores sin scroll-behavior: smooth)
───────────────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (!target) return;
      // Compensar la altura del navbar
      var navH    = document.getElementById('navbar').offsetHeight;
      var top     = target.getBoundingClientRect().top + window.scrollY - navH - 8;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
})();
