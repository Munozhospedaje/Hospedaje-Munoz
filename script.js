/**
 * HOSPEDAJE MUÑOZ — script.js
 * Funcionalidades:
 *  1. Navbar: toggle móvil + sombra al hacer scroll
 *  2. Scroll Reveal: animación de aparición progresiva
 *  3. Habitaciones: botones de tarjetas pre-seleccionan habitación en el form
 *  4. Experiencias opcionales: mostrar/ocultar campos adicionales al marcar checkbox
 *  5. Formulario de reserva: validación + mensaje WhatsApp con tours y nota final
 *  6. Fecha mínima de los inputs de fecha = hoy
 *  7. Carrusel de fotos de habitaciones
 *  8. Smooth scroll (fallback)
 */

/* ─────────────────────────────────────────
   1. NAVBAR — toggle móvil y sombra al scroll
───────────────────────────────────────── */
(function initNavbar() {
  var toggle   = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  var navbar   = document.getElementById('navbar');

  toggle.addEventListener('click', function () {
    navLinks.classList.toggle('open');
    toggle.setAttribute('aria-expanded', navLinks.classList.contains('open'));
  });

  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
    });
  });

  window.addEventListener('scroll', function () {
    navbar.style.boxShadow = window.scrollY > 10
      ? '0 4px 24px rgba(46,156,156,.18)'
      : '';
  }, { passive: true });
})();


/* ─────────────────────────────────────────
   2. SCROLL REVEAL
───────────────────────────────────────── */
(function initScrollReveal() {
  var targets = document.querySelectorAll(
    '.room-card, .service-item, .exp-card, .testimonial-card, .section-header, .location-detail'
  );

  targets.forEach(function (el) { el.classList.add('reveal'); });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(function (el) { observer.observe(el); });
})();


/* ─────────────────────────────────────────
   3. HABITACIONES — pre-seleccionar en form
───────────────────────────────────────── */
(function initRoomButtons() {
  document.querySelectorAll('[data-room]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var roomName = btn.getAttribute('data-room');
      var select   = document.getElementById('habitacion');
      if (!select || !roomName) return;
      Array.from(select.options).forEach(function (option) {
        if (option.value.startsWith(roomName)) {
          select.value = option.value;
        }
      });
    });
  });
})();


/* ─────────────────────────────────────────
   4. EXPERIENCIAS — mostrar/ocultar detalles
───────────────────────────────────────── */
(function initExperienceToggles() {
  for (var i = 1; i <= 5; i++) {
    (function (num) {
      var checkbox = document.querySelector('[name="exp' + num + '"]');
      var details  = document.getElementById('details-exp' + num);
      if (!checkbox || !details) return;

      checkbox.addEventListener('change', function () {
        if (checkbox.checked) {
          details.style.display = 'block';
          details.style.opacity = '0';
          details.style.transform = 'translateY(-8px)';
          requestAnimationFrame(function () {
            details.style.transition = 'opacity .3s ease, transform .3s ease';
            details.style.opacity = '1';
            details.style.transform = 'translateY(0)';
          });
        } else {
          details.style.display = 'none';
          details.querySelectorAll('input').forEach(function (inp) { inp.value = ''; });
        }
      });
    })(i);
  }
})();


/* ─────────────────────────────────────────
   5. FORMULARIO DE RESERVA — validación + WhatsApp
   CORRECCIÓN CRÍTICA: event.preventDefault() garantizado,
   encodeURIComponent() en el mensaje, window.open(_blank).
   El mensaje incluye tours con fecha, personas y nota legal.
───────────────────────────────────────── */
(function initForm() {
  var form      = document.getElementById('reservaForm');
  var WA_NUMBER = '51945087266';

  if (!form) return; /* seguridad: salir si el form no existe */

  /* ── Fecha mínima = hoy para todos los date inputs ── */
  var hoy = new Date();
  var todayStr = hoy.getFullYear() + '-' +
    String(hoy.getMonth() + 1).padStart(2, '0') + '-' +
    String(hoy.getDate()).padStart(2, '0');

  document.querySelectorAll('input[type="date"]').forEach(function (inp) {
    inp.setAttribute('min', todayStr);
  });

  /* ── Formatear fecha YYYY-MM-DD → DD/MM/YYYY ── */
  function formatFecha(str) {
    if (!str) return '—';
    var p = str.split('-');
    return p[2] + '/' + p[1] + '/' + p[0];
  }

  /* ── Listener de envío ── */
  form.addEventListener('submit', function (e) {
    /* CORRECCIÓN: siempre prevenir recarga de página */
    e.preventDefault();

    /* ── Validar campos obligatorios de hospedaje ── */
    var nombre     = form.nombre.value.trim();
    var telefono   = form.telefono.value.trim();
    var habitacion = form.habitacion.value;
    var huespedes  = form.huespedes.value;
    var checkin    = form.checkin.value;
    var checkout   = form.checkout.value;
    var llegada    = form.llegada.value;

    if (!nombre || !telefono || !habitacion || !huespedes || !checkin || !checkout || !llegada) {
      alert('Por favor completa todos los campos obligatorios (marcados con *).');
      return;
    }

    if (checkin >= checkout) {
      alert('La fecha de salida debe ser posterior a la fecha de ingreso.');
      return;
    }

    /* ── Validar tours seleccionados: fecha y personas obligatorios ── */
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
        var fecInp = form['exp' + i + '_fecha'];
        var perInp = form['exp' + i + '_personas'];
        if (!fecInp || !fecInp.value) {
          alert('Por favor indica la fecha exacta para el tour: ' + expNames[i - 1]);
          return;
        }
        if (!perInp || !perInp.value || parseInt(perInp.value) < 1) {
          alert('Por favor indica la cantidad de personas para el tour: ' + expNames[i - 1]);
          return;
        }
      }
    }

    /* ── Calcular noches ── */
    var msPerDay = 1000 * 60 * 60 * 24;
    var noches   = Math.round(
      (new Date(checkout + 'T00:00:00') - new Date(checkin + 'T00:00:00')) / msPerDay
    );

    /* ── Recopilar tours seleccionados ── */
    var toursTexto = '';
    for (var j = 1; j <= 5; j++) {
      var chk = form['exp' + j];
      if (chk && chk.checked) {
        var fecha    = form['exp' + j + '_fecha'].value;
        var personas = form['exp' + j + '_personas'].value;
        toursTexto +=
          '\n   • ' + expNames[j - 1] +
          '\n     - Fecha: ' + formatFecha(fecha) +
          '\n     - Personas: ' + personas;
      }
    }
    if (!toursTexto) toursTexto = '\n   (Ninguno seleccionado)';

    /* ── Observaciones ── */
    var observaciones = form.observaciones.value.trim() || '(Sin observaciones)';

    /* ── Construir mensaje WhatsApp ── */
    var mensaje =
      '🏨 *SOLICITUD DE RESERVA — HOSPEDAJE MUÑOZ*\n' +
      '━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      '👤 *Datos del huésped*\n' +
      '   • Nombre: ' + nombre + '\n' +
      '   • Teléfono: ' + telefono + '\n\n' +
      '🛏️ *Reserva de hospedaje*\n' +
      '   • Habitación: ' + habitacion + '\n' +
      '   • Huéspedes: ' + huespedes + '\n' +
      '   • Check-in: ' + formatFecha(checkin) + ' (desde 1:00 p.m.)\n' +
      '   • Check-out: ' + formatFecha(checkout) + ' (hasta 11:00 a.m.)\n' +
      '   • Noches: ' + noches + '\n' +
      '   • Hora de llegada aprox.: ' + llegada + '\n\n' +
      '🌄 *Tours seleccionados*' + toursTexto + '\n\n' +
      '📝 *Observaciones*\n' +
      '   ' + observaciones + '\n\n' +
      '━━━━━━━━━━━━━━━━━━━━━━\n' +
      '⚠️ *Nota:* Los pagos por impuestos tributarios o ingresos a atractivos turísticos no están incluidos en el precio del tour.\n\n' +
      '📲 Enviado desde: gentlevins.com';

    /* CORRECCIÓN: encodeURIComponent + window.open(_blank) */
    var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(mensaje);
    window.open(url, '_blank');
  });
})();


/* ─────────────────────────────────────────
   6. CARRUSEL DE FOTOS DE HABITACIONES
───────────────────────────────────────── */
(function initRoomCarousels() {
  var carousels = document.querySelectorAll('.room-carousel:not(.room-carousel--single)');

  carousels.forEach(function (carousel) {
    var slides  = carousel.querySelectorAll('.room-slide');
    var dots    = carousel.querySelectorAll('.carousel-dot');
    var prev    = carousel.querySelector('.carousel-prev');
    var next    = carousel.querySelector('.carousel-next');
    var total   = slides.length;
    var current = 0;

    if (total <= 1) return;

    function goTo(index) {
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = (index + total) % total;
      slides[current].classList.add('active');
      dots[current].classList.add('active');
    }

    prev.addEventListener('click', function (e) { e.preventDefault(); goTo(current - 1); });
    next.addEventListener('click', function (e) { e.preventDefault(); goTo(current + 1); });

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { goTo(i); });
    });

    var touchStartX = 0;
    carousel.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    carousel.addEventListener('touchend', function (e) {
      var delta = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 40) goTo(delta < 0 ? current + 1 : current - 1);
    }, { passive: true });
  });
})();


/* ─────────────────────────────────────────
   7. SMOOTH ANCHOR SCROLL (fallback para
      navegadores sin scroll-behavior: smooth)
───────────────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (!target) return;
      var navH = document.getElementById('navbar').offsetHeight;
      var top  = target.getBoundingClientRect().top + window.scrollY - navH - 8;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
})();
