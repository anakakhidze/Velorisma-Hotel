'use strict';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const createModal = (id, title, bodyHTML) => {
  $(`#${id}`)?.remove();

  const overlay = document.createElement('div');
  overlay.id = id;
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:99999;
    background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);
    display:flex;align-items:center;justify-content:center;padding:1rem;
    animation:fadeIn 0.25s ease;
  `;

  overlay.innerHTML = `
    <div class="vel-modal-box" style="
      background:#faf8f5;border-radius:20px;max-width:560px;width:100%;
      max-height:90vh;overflow-y:auto;box-shadow:0 24px 80px rgba(0,0,0,0.35);
      animation:slideUp 0.3s ease;
    ">
      <div style="padding:2rem 2rem 1rem;border-bottom:1px solid rgba(168,84,43,0.2);display:flex;justify-content:space-between;align-items:center;">
        <h2 style="font-family:'League Spartan',sans-serif;font-size:1.1rem;font-weight:700;letter-spacing:0.2em;color:#3d1a0a;">${title}</h2>
        <button class="vel-close-modal" style="background:none;border:none;font-size:1.6rem;cursor:pointer;color:#3d1a0a;line-height:1;">✕</button>
      </div>
      <div style="padding:2rem;">${bodyHTML}</div>
    </div>
  `;

  if (!$('#vel-modal-style')) {
    const style = document.createElement('style');
    style.id = 'vel-modal-style';
    style.textContent = `
      @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
      @keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
      .vel-modal-box input,
      .vel-modal-box select,
      .vel-modal-box textarea {
        width:100%;background:rgba(232,213,203,0.4);border:1px solid rgba(84,13,1,0.4);
        border-radius:6px;padding:0.75rem 0.8rem;font-family:Lora,serif;font-size:0.85rem;
        color:#1a1714;outline:none;margin-bottom:1rem;box-sizing:border-box;
        transition:border-color 0.3s;
      }
      .vel-modal-box input:focus,
      .vel-modal-box select:focus,
      .vel-modal-box textarea:focus { border-color:#c9a84c; }
      .vel-modal-box label {
        display:block;font-family:'League Spartan',sans-serif;font-size:0.7rem;
        font-weight:700;letter-spacing:0.18em;color:#6b5a50;margin-bottom:0.3rem;
      }
      .vel-modal-box .frow { display:flex;gap:1rem; }
      .vel-modal-box .frow > div { flex:1; }
      .vel-btn-submit {
        display:block;width:100%;padding:1rem;border:none;border-radius:50px;
        background:#a8542b;color:#fff;font-family:'League Spartan',sans-serif;
        font-size:0.95rem;font-weight:700;letter-spacing:0.18em;cursor:pointer;
        transition:all 0.3s;margin-top:0.5rem;
      }
      .vel-btn-submit:hover { background:#fff;color:#a8542b;box-shadow:0 0 0 2px #a8542b; }
      .vel-menu-grid { display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;margin-bottom:1.5rem; }
      .vel-menu-item {
        background:#fff;border:1px solid rgba(168,84,43,0.15);border-radius:12px;
        padding:0.9rem 1rem;font-family:Lora,serif;font-size:0.82rem;color:#3d1a0a;
        display:flex;justify-content:space-between;align-items:center;
      }
      .vel-menu-price { font-family:'League Spartan',sans-serif;font-weight:700;color:#a8542b;font-size:0.9rem; }
      .vel-section-label {
        font-family:'League Spartan',sans-serif;font-size:0.72rem;font-weight:700;
        letter-spacing:0.25em;color:#a8542b;margin:1.2rem 0 0.8rem;text-transform:uppercase;
      }
      .vel-info-text { font-family:Lora,serif;font-size:0.88rem;color:#555;line-height:1.7;margin-bottom:1rem; }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  const close = () => {
    overlay.style.animation = 'fadeIn 0.2s ease reverse';
    setTimeout(() => { overlay.remove(); document.body.style.overflow = ''; }, 200);
  };

  overlay.querySelector('.vel-close-modal').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
  });

  return { overlay, close };
};

const modalFormSubmit = (form, storageKey, dataBuilder, successMsg, close) => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.vel-btn-submit');
    btn.textContent = 'SENDING…';
    btn.disabled = true;

    await new Promise(r => setTimeout(r, 900));

    const entry = dataBuilder(form);
    const existing = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    localStorage.setItem(storageKey, JSON.stringify([...existing, entry]));

    showToast(successMsg, 'success');
    close();
  });
};


/* ================================================================
   3. HAMBURGER MENU
   Handles opening/closing the mobile navigation menu.
   ================================================================ */
const initHamburger = () => {
  const btn     = $('#hamburger-btn');
  const overlay = $('#mobile-menu');
  if (!btn || !overlay) return;

  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    overlay.classList.toggle('active');
  });

  $$('.mobile-nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      btn.classList.remove('open');
      overlay.classList.remove('active');
    });
  });
};


/* ================================================================
   4. STICKY HEADER SHADOW
   Adds a stronger shadow under the header once the page is scrolled,
   to visually separate it from the content beneath it.
   ================================================================ */
const initStickyHeader = () => {
  const header = $('.site-header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 60
      ? '0 4px 24px rgba(0,0,0,0.22)'
      : '0px 1px 4px rgba(0,0,0,0.462)';
  });
};


/* ================================================================
   5. GALLERY SCROLL
   Lets the arrow buttons next to the photo gallery scroll it
   horizontally by a fixed amount, with smooth animation.
   ================================================================ */
window.scrollGallery = (dir) => {
  const row = $('#gallery');
  if (!row) return;
  row.scrollBy({ left: dir * 320, behavior: 'smooth' });
};


/* ================================================================
   6. ROOM FILTER PILLS
   The clickable "pill" buttons (ALL / CATEGORY / ROOM TYPE / VIEW)
   that filter which room cards are visible.
   ================================================================ */
const initRoomFilter = () => {
  const pills = $$('.filter-pills .pill');
  const cards = $$('.room-card');

  const categoryMap = {
    'ALL':       () => true,
    'CATEGORY':  ({ badge }) => ['SUITE','DELUXE','PENTHOUSE'].includes(badge),
    'ROOM TYPE': ({ badge }) => badge === 'STANDARD',
    'VIEW':      ({ desc })  => /sea|panoramic|garden|coast|atrium/i.test(desc),
  };

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const label  = pill.textContent.trim().toUpperCase();
      const filter = categoryMap[label] ?? (() => true);

      cards.forEach(card => {
        const badge = ($('.room-badge', card)?.textContent ?? '').trim().toUpperCase();
        const desc  = ($('.room-desc', card)?.textContent ?? '').toLowerCase();
        const show  = filter({ badge, desc });

        card.style.display   = show ? 'flex'     : 'none';
        card.style.opacity   = show ? '1'        : '0';
        card.style.transform = show ? 'scale(1)' : 'scale(0.95)';
      });
    });
  });
};


/* ================================================================
   7. ROOM BOOK BUTTONS — pre-fill reservation form
   When a user clicks "Book" on a specific room card, this jumps them
   to the reservation form with that room already selected.
   ================================================================ */
const initRoomBookButtons = () => {
  $$('.room-card .book').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card     = btn.closest('.room-card');
      const roomName = card.querySelector('h3')?.textContent.trim() ?? '';
      const roomSel  = $('#room-select');

      if (roomSel) {
        [...roomSel.options].forEach((opt, i) => {
          if (opt.text.toUpperCase().includes(roomName.split(' ')[0])) roomSel.selectedIndex = i;
        });
        roomSel.dispatchEvent(new Event('change'));
      }

      document.querySelector('#reservation')?.scrollIntoView({ behavior: 'smooth' });
      showToast(`🛏 ${roomName} pre-selected in the reservation form!`, 'info');
    });
  });
};


/* ================================================================
   8. RESERVATION PRICE CALCULATOR
   Live price estimate shown in the reservation form as the user
   picks a room, dates, and optional add-on services.
   ================================================================ */

const ROOM_PRICES = {
  'azure-suite':    200,
  'panoramic-king': 250,
  'shoreline-std':  150,
  'penthouse':      320,
  'garden-suite':   180,
  'coast-std':      150,
  'garden-terrace': 250,
  'atrium-std':     150,
};

const SERVICE_PRICES = { spa: 80, dining: 60, transfer: 40, events: 50 };

const calcTotal = (roomVal, checkin, checkout, services = []) => {
  const nights = (() => {
    if (!checkin || !checkout) return 1;
    const diff = new Date(checkout) - new Date(checkin);
    return Math.max(1, Math.round(diff / 86400000));
  })();
  const roomCost    = (ROOM_PRICES[roomVal] ?? 0) * nights;
  const serviceCost = [...services].reduce((acc, s) => acc + (SERVICE_PRICES[s] ?? 0), 0);
  return { nights, roomCost, serviceCost, total: roomCost + serviceCost };
};

const initReservationCalc = () => {
  const form       = $('.res-form');
  const roomSel    = $('#room-select');
  const checkinEl  = $('#checkin');
  const checkoutEl = $('#checkout');
  if (!form || !roomSel) return;

  const summary = document.createElement('div');
  summary.id        = 'price-summary';
  summary.innerHTML = '<p style="color:#888;font-size:0.85rem;">Select a room and dates to see your price estimate.</p>';
  summary.style.cssText = `
    background:rgba(168,84,43,0.08);border:1px solid rgba(168,84,43,0.3);
    border-radius:12px;padding:1.2rem 1.5rem;margin-bottom:1.2rem;
    font-family:'League Spartan',sans-serif;font-size:0.9rem;
    letter-spacing:0.05em;color:#3d1a0a;
  `;
  form.insertBefore(summary, form.lastElementChild);

  const updateSummary = () => {
    const roomVal  = roomSel.value;
    const checkin  = checkinEl?.value;
    const checkout = checkoutEl?.value;
    const services = $$('input[name="service"]:checked').map(el => el.value);

    if (!roomVal) {
      summary.innerHTML = '<p style="color:#888;font-size:0.85rem;">Select a room and dates to see your price estimate.</p>';
      return;
    }

    const { nights, roomCost, serviceCost, total } = calcTotal(roomVal, checkin, checkout, services);
    const roomLabel = roomSel.options[roomSel.selectedIndex].text.split('–')[0].trim();

    summary.innerHTML = `
      <strong>💰 Price Estimate</strong>
      <div style="margin-top:0.6rem;display:flex;flex-direction:column;gap:0.3rem;">
        <span>🛏 ${roomLabel} × ${nights} night${nights !== 1 ? 's' : ''} = <b>$${roomCost}</b></span>
        ${serviceCost > 0 ? `<span>✨ Additional services = <b>$${serviceCost}</b></span>` : ''}
        <span style="border-top:1px solid rgba(168,84,43,0.3);padding-top:0.4rem;margin-top:0.3rem;font-size:1.05rem;font-weight:700;">
          Total Estimate: $${total}
        </span>
      </div>
    `;
  };

  [roomSel, checkinEl, checkoutEl].forEach(el => el?.addEventListener('change', updateSummary));
  $$('input[name="service"]').forEach(cb => cb.addEventListener('change', updateSummary));
};


/* ================================================================
   9. RESERVATION FORM SUBMIT
   Handles the actual booking form submission (separate from the
   live price calculator above).
   ================================================================ */

const fakeServerSave = () =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      Math.random() > 0.05
        ? resolve({ ok: true, id: `VEL-${Date.now()}` })
        : reject(new Error('Server error'));
    }, 1200);
  });

const saveToStorage = (key, item) => {
  const existing = JSON.parse(localStorage.getItem(key) ?? '[]');
  const updated  = [...existing, item];
  localStorage.setItem(key, JSON.stringify(updated));
};

const initReservationSubmit = () => {
  const form = $('.res-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('.btn.confirm', form);
    const { fname, lname, email, room, board, requests } = form.elements;
    const services = $$('input[name="service"]:checked', form).map(el => el.value);

    const reservation = {
      id:        `VEL-${Date.now()}`,
      type:      'room',
      firstName: fname.value.trim(),
      lastName:  lname.value.trim(),
      email:     email.value.trim(),
      room:      room.value,
      board:     board.value,
      services:  [...services],
      requests:  requests.value.trim(),
      checkin:   $('#checkin')?.value  ?? '',
      checkout:  $('#checkout')?.value ?? '',
      timestamp: new Date().toISOString(),
    };

    btn.textContent   = 'SENDING…';
    btn.style.opacity = '0.7';
    btn.disabled      = true;

    try {
      const result = await fakeServerSave();
      saveToStorage('velorisma_reservations', reservation);
      showToast(`✅ Reservation confirmed! Ref: ${result.id}`, 'success');
      form.reset();
      const summary = $('#price-summary');
      if (summary) summary.innerHTML = '<p style="color:#888;font-size:0.85rem;">Select a room and dates to see your price estimate.</p>';
    } catch (err) {
      showToast(`❌ ${err.message}. Please try again.`, 'error');
    } finally {
      btn.textContent   = 'CONFIRM RESERVATION';
      btn.style.opacity = '1';
      btn.disabled      = false;
    }
  });
};


/* ================================================================
   10. CHECK AVAILABILITY FORM
   A separate, smaller form (often above the reservation form) that
   lets users check date availability before booking.
   ================================================================ */

const checkAvailability = (checkin, checkout) =>
  new Promise((resolve) => {
    setTimeout(() => {
      const valid = checkin && checkout && new Date(checkout) > new Date(checkin);
      resolve({
        available: valid,
        rooms:     valid ? Math.floor(Math.random() * 5) + 1 : 0,
        message:   valid
          ? '✅ Great news! Rooms available for your dates.'
          : '⚠️ Please select valid check-in and check-out dates.',
      });
    }, 800);
  });

const initAvailabilityForm = () => {
  const form = $('.avail-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = $('.btn.check', form);
    btn.textContent = 'CHECKING…';
    btn.disabled    = true;

    checkAvailability($('#checkin')?.value, $('#checkout')?.value)
      .then(({ available, rooms, message }) => {
        showToast(
          available ? `${message} (${rooms} room${rooms !== 1 ? 's' : ''} left!)` : message,
          available ? 'success' : 'error'
        );
        if (available) {
          document.querySelector('#reservation .res-form-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      })
      .catch(() => showToast('Something went wrong. Please try again.', 'error'))
      .finally(() => {
        btn.textContent = 'CHECK AVAILABILITY';
        btn.disabled    = false;
      });
  });
};


/* ================================================================
   11. NEWSLETTER SIGNUP
   ================================================================ */

const saveEmail = (email, callback) => {
  setTimeout(() => {
    const emails = JSON.parse(localStorage.getItem('velorisma_emails') ?? '[]');
    if (emails.includes(email)) { callback(null, 'already_subscribed'); return; }
    emails.push(email);
    localStorage.setItem('velorisma_emails', JSON.stringify(emails));
    callback(null, 'subscribed');
  }, 600);
};

const initNewsletter = () => {
  const form = $('.signup-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('input[type="email"]', form);
    const email = input.value.trim().toLowerCase();

    saveEmail(email, (err, status) => {
      if (status === 'already_subscribed') {
        showToast("📧 You're already subscribed!", 'info');
      } else {
        showToast('🎉 Subscribed! Exclusive offers coming your way.', 'success');
        input.value = '';
      }
    });
  });
};


/* ================================================================
   12. RESTAURANT — LEARN MORE MODAL
   Static informational modal: hours, dress code, description.
   ================================================================ */
const openRestaurantLearnMore = () => {
  const body = `
    <p class="vel-info-text">
      Our ocean-view restaurant seats 120 guests across two levels, with an open kitchen 
      and a dedicated wine cellar housing over 400 labels. Executive Chef Marco Rossi leads 
      a team dedicated to local Georgian ingredients and international fine dining technique.
    </p>
    <div class="vel-section-label">Opening Hours</div>
    <div class="vel-menu-grid">
      <div class="vel-menu-item"><span>Breakfast</span><span class="vel-menu-price">07:00 – 11:00</span></div>
      <div class="vel-menu-item"><span>Lunch</span><span class="vel-menu-price">12:00 – 15:30</span></div>
      <div class="vel-menu-item"><span>Dinner</span><span class="vel-menu-price">18:00 – 23:00</span></div>
      <div class="vel-menu-item"><span>Bar</span><span class="vel-menu-price">11:00 – 01:00</span></div>
    </div>
    <div class="vel-section-label">Dress Code</div>
    <p class="vel-info-text">Smart casual for lunch. Smart elegant required for dinner service.</p>
  `;
  createModal('modal-restaurant-info', 'HOTEL RESTAURANT', body);
};


/* ================================================================
   13. RESTAURANT — FULL MENU MODAL
   Static content modal listing menu categories and prices.
   ================================================================ */
const openFullMenu = () => {
  const body = `
    <div class="vel-section-label">🐟 Seafood</div>
    <div class="vel-menu-grid">
      <div class="vel-menu-item"><span>Black Sea Bass</span><span class="vel-menu-price">$38</span></div>
      <div class="vel-menu-item"><span>Grilled Shrimp</span><span class="vel-menu-price">$32</span></div>
      <div class="vel-menu-item"><span>Lobster Bisque</span><span class="vel-menu-price">$22</span></div>
      <div class="vel-menu-item"><span>Oysters (6pc)</span><span class="vel-menu-price">$28</span></div>
    </div>
    <div class="vel-section-label">🥩 Fine Dining</div>
    <div class="vel-menu-grid">
      <div class="vel-menu-item"><span>Wagyu Tenderloin</span><span class="vel-menu-price">$68</span></div>
      <div class="vel-menu-item"><span>Duck Confit</span><span class="vel-menu-price">$42</span></div>
      <div class="vel-menu-item"><span>Lamb Rack</span><span class="vel-menu-price">$54</span></div>
      <div class="vel-menu-item"><span>Truffle Risotto</span><span class="vel-menu-price">$36</span></div>
    </div>
    <div class="vel-section-label">🍰 Desserts</div>
    <div class="vel-menu-grid">
      <div class="vel-menu-item"><span>Crème Brûlée</span><span class="vel-menu-price">$14</span></div>
      <div class="vel-menu-item"><span>Chocolate Fondant</span><span class="vel-menu-price">$16</span></div>
      <div class="vel-menu-item"><span>Baklava Tart</span><span class="vel-menu-price">$12</span></div>
      <div class="vel-menu-item"><span>Gelato Selection</span><span class="vel-menu-price">$10</span></div>
    </div>
    <div class="vel-section-label">🍸 Cocktails</div>
    <div class="vel-menu-grid">
      <div class="vel-menu-item"><span>Velorisma Sunset</span><span class="vel-menu-price">$18</span></div>
      <div class="vel-menu-item"><span>Black Sea Mule</span><span class="vel-menu-price">$16</span></div>
      <div class="vel-menu-item"><span>Georgian Wine</span><span class="vel-menu-price">$12</span></div>
      <div class="vel-menu-item"><span>Champagne Flute</span><span class="vel-menu-price">$22</span></div>
    </div>
  `;
  createModal('modal-full-menu', 'FULL MENU', body);
};


/* ================================================================
   14. RESTAURANT — BOOK A TABLE MODAL
   Modal containing a form to reserve a restaurant table.
   ================================================================ */
const openBookTable = () => {
  const body = `
    <form id="form-book-table">
      <div class="frow">
        <div><label>First Name *</label><input type="text" name="fname" placeholder="John" required /></div>
        <div><label>Last Name *</label><input type="text" name="lname" placeholder="Doe" required /></div>
      </div>
      <label>Email *</label>
      <input type="email" name="email" placeholder="john@example.com" required />
      <div class="frow">
        <div>
          <label>Date *</label>
          <input type="date" name="date" required />
        </div>
        <div>
          <label>Time *</label>
          <select name="time">
            <option>07:00</option><option>08:00</option><option>09:00</option>
            <option>12:00</option><option>13:00</option><option>14:00</option>
            <option>18:00</option><option>19:00</option><option>20:00</option><option>21:00</option>
          </select>
        </div>
      </div>
      <label>Number of Guests *</label>
      <select name="guests">
        <option>1 Guest</option><option>2 Guests</option><option>3 Guests</option>
        <option>4 Guests</option><option>5 Guests</option><option>6+ Guests</option>
      </select>
      <label>Occasion</label>
      <select name="occasion">
        <option value="">— Select if applicable —</option>
        <option>Birthday</option><option>Anniversary</option>
        <option>Business Dinner</option><option>Proposal</option><option>Other</option>
      </select>
      <label>Special Requests</label>
      <textarea name="requests" rows="3" placeholder="Dietary requirements, allergies, special setup…"></textarea>
      <button type="submit" class="vel-btn-submit">CONFIRM TABLE BOOKING</button>
    </form>
  `;

  const { close } = createModal('modal-book-table', 'BOOK A TABLE', body);

  modalFormSubmit(
    $('#form-book-table'),
    'velorisma_table_bookings',
    (form) => {
      const { fname, lname, email, date, time, guests, occasion, requests } = form.elements;
      return {
        id: `TBL-${Date.now()}`,
        firstName: fname.value.trim(),
        lastName:  lname.value.trim(),
        email:     email.value.trim(),
        date:      date.value,
        time:      time.value,
        guests:    guests.value,
        occasion:  occasion.value,
        requests:  requests.value.trim(),
        timestamp: new Date().toISOString(),
      };
    },
    '✅ Table booked! We look forward to welcoming you.',
    close
  );
};


/* ================================================================
   15. SPA — LEARN MORE MODAL
   Static informational modal about the spa's facilities and
   signature treatments.
   ================================================================ */
const openSpaLearnMore = () => {
  const body = `
    <p class="vel-info-text">
      The Velorisma Sanctuary spans 1,200 m² of dedicated wellness space, 
      blending ancient Georgian bathing traditions with cutting-edge modern therapies.
      Our team of 18 certified therapists is available every day from 07:00 to 22:00.
    </p>
    <div class="vel-section-label">Facilities</div>
    <div class="vel-menu-grid">
      <div class="vel-menu-item"><span>🛁 Hammam</span><span class="vel-menu-price">Included</span></div>
      <div class="vel-menu-item"><span>🧖 Treatment Rooms</span><span class="vel-menu-price">12 Rooms</span></div>
      <div class="vel-menu-item"><span>🏊 Thermal Pool</span><span class="vel-menu-price">Included</span></div>
      <div class="vel-menu-item"><span>🔥 Finnish Sauna</span><span class="vel-menu-price">Included</span></div>
      <div class="vel-menu-item"><span>🧘 Yoga Studio</span><span class="vel-menu-price">Classes Daily</span></div>
      <div class="vel-menu-item"><span>💪 Fitness Centre</span><span class="vel-menu-price">24 / 7</span></div>
    </div>
    <div class="vel-section-label">Signature Experiences</div>
    <div class="vel-menu-grid">
      <div class="vel-menu-item"><span>Black Sea Ritual</span><span class="vel-menu-price">$180</span></div>
      <div class="vel-menu-item"><span>Georgian Honey Wrap</span><span class="vel-menu-price">$140</span></div>
      <div class="vel-menu-item"><span>Couples Retreat</span><span class="vel-menu-price">$320</span></div>
      <div class="vel-menu-item"><span>Deep Tissue Massage</span><span class="vel-menu-price">$120</span></div>
    </div>
  `;
  createModal('modal-spa-info', 'THE VELORISMA SANCTUARY', body);
};


/* ================================================================
   16. SPA — BOOK A SESSION MODAL
   Modal with a form for booking a specific spa treatment.
   ================================================================ */
const openBookSpa = () => {
  const body = `
    <form id="form-book-spa">
      <div class="frow">
        <div><label>First Name *</label><input type="text" name="fname" placeholder="John" required /></div>
        <div><label>Last Name *</label><input type="text" name="lname" placeholder="Doe" required /></div>
      </div>
      <label>Email *</label>
      <input type="email" name="email" placeholder="john@example.com" required />
      <label>Treatment *</label>
      <select name="treatment" required>
        <option value="">— Select a Treatment —</option>
        <option value="black-sea-ritual">Black Sea Ritual – $180</option>
        <option value="honey-wrap">Georgian Honey Wrap – $140</option>
        <option value="couples-retreat">Couples Retreat – $320</option>
        <option value="deep-tissue">Deep Tissue Massage – $120</option>
        <option value="swedish">Swedish Massage – $95</option>
        <option value="facial">Revitalising Facial – $110</option>
        <option value="yoga">Private Yoga Session – $75</option>
        <option value="hammam">Hammam Experience – $85</option>
      </select>
      <div class="frow">
        <div><label>Preferred Date *</label><input type="date" name="date" required /></div>
        <div>
          <label>Preferred Time *</label>
          <select name="time">
            <option>07:00</option><option>08:00</option><option>09:00</option>
            <option>10:00</option><option>11:00</option><option>12:00</option>
            <option>13:00</option><option>14:00</option><option>15:00</option>
            <option>16:00</option><option>17:00</option><option>18:00</option>
            <option>19:00</option><option>20:00</option>
          </select>
        </div>
      </div>
      <label>Special Notes</label>
      <textarea name="notes" rows="3" placeholder="Any health conditions, preferences, or notes for your therapist…"></textarea>
      <button type="submit" class="vel-btn-submit">BOOK SESSION</button>
    </form>
  `;

  const { close } = createModal('modal-book-spa', 'BOOK A SPA SESSION', body);

  modalFormSubmit(
    $('#form-book-spa'),
    'velorisma_spa_bookings',
    (form) => {
      const { fname, lname, email, treatment, date, time, notes } = form.elements;
      return {
        id:        `SPA-${Date.now()}`,
        firstName: fname.value.trim(),
        lastName:  lname.value.trim(),
        email:     email.value.trim(),
        treatment: treatment.value,
        date:      date.value,
        time:      time.value,
        notes:     notes.value.trim(),
        timestamp: new Date().toISOString(),
      };
    },
    '✅ Spa session booked! Your sanctuary awaits.',
    close
  );
};


/* ================================================================
   17. EVENTS — VIEW MORE MODALS
   Data + modal for each event category (weddings, summits, nights,
   galas), each with its own packages and an enquiry form.
   ================================================================ */

const EVENT_DATA = {
  'WEDDINGS': {
    title: 'WEDDINGS AT VELORISMA',
    info: 'Our coastal ceremony space accommodates up to 300 guests with panoramic Black Sea views. We offer full planning, floral, catering, and entertainment coordination.',
    packages: [
      { name: 'Intimate Ceremony', price: '$2,500', detail: 'Up to 30 guests, ceremony + champagne reception' },
      { name: 'Classic Wedding',   price: '$5,500', detail: 'Up to 100 guests, ceremony + 3-course dinner' },
      { name: 'Grand Celebration', price: '$12,000', detail: 'Up to 300 guests, full day, open bar, live band' },
    ],
  },
  'EXECUTIVE SUMMITS': {
    title: 'EXECUTIVE SUMMITS',
    info: 'Two dedicated conference suites with state-of-the-art AV, high-speed Wi-Fi, breakout rooms, and a dedicated events concierge for seamless professional gatherings.',
    packages: [
      { name: 'Half-Day Meeting',    price: '$1,000', detail: 'Up to 20 delegates, AV + coffee service' },
      { name: 'Full-Day Conference', price: '$2,200', detail: 'Up to 50 delegates, AV + lunch + breaks' },
      { name: 'Executive Retreat',   price: '$5,000', detail: 'Multi-day, accommodation + all meals included' },
    ],
  },
  'VELORISMA NIGHTS': {
    title: 'VELORISMA NIGHTS',
    info: 'From sunset acoustic sessions on the beach to exclusive DJ nights at our rooftop club, every Velorisma Night is a curated experience of music, cocktails, and sea breeze.',
    packages: [
      { name: 'General Admission', price: '$50',    detail: 'Beach party access, welcome cocktail' },
      { name: 'VIP Table',         price: '$300',   detail: 'Reserved table for 4, bottle service' },
      { name: 'Private Event',     price: '$1,000+', detail: 'Exclusive venue hire, custom F&B package' },
    ],
  },
  'PRIVATE GALAS': {
    title: 'PRIVATE GALAS',
    info: 'Our Grand Ballroom hosts up to 250 guests in architectural luxury. Perfect for milestone birthdays, anniversaries, product launches, and black-tie celebrations.',
    packages: [
      { name: 'Silver Gala',   price: '$1,500', detail: 'Up to 50 guests, 3-course dinner, décor' },
      { name: 'Gold Gala',     price: '$4,000', detail: 'Up to 120 guests, full bar, live entertainment' },
      { name: 'Platinum Gala', price: '$9,000', detail: 'Up to 250 guests, full production, open bar' },
    ],
  },
};

const openEventModal = (eventName) => {
  const { title, info, packages } = EVENT_DATA[eventName] ?? {};
  if (!title) return;

  const pkgHTML = packages.map(({ name, price, detail }) => `
    <div style="background:#fff;border-radius:12px;padding:1rem 1.2rem;margin-bottom:0.8rem;border:1px solid rgba(168,84,43,0.15);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.3rem;">
        <strong style="font-family:'League Spartan',sans-serif;font-size:0.85rem;color:#3d1a0a;">${name}</strong>
        <span style="font-family:'League Spartan',sans-serif;font-weight:700;color:#a8542b;">${price}</span>
      </div>
      <p style="font-family:Lora,serif;font-size:0.8rem;color:#777;margin:0;">${detail}</p>
    </div>
  `).join('');

  const body = `
    <p class="vel-info-text">${info}</p>
    <div class="vel-section-label">Packages</div>
    ${pkgHTML}
    <form id="form-event-enquiry">
      <div class="vel-section-label" style="margin-top:1.5rem;">Send an Enquiry</div>
      <input type="hidden" name="eventType" value="${eventName}" />
      <div class="frow">
        <div><label>First Name *</label><input type="text" name="fname" placeholder="John" required /></div>
        <div><label>Last Name *</label><input type="text" name="lname" placeholder="Doe" required /></div>
      </div>
      <label>Email *</label>
      <input type="email" name="email" placeholder="john@example.com" required />
      <div class="frow">
        <div><label>Preferred Date</label><input type="date" name="date" /></div>
        <div><label>Number of Guests</label><input type="number" name="guests" placeholder="e.g. 80" min="1" /></div>
      </div>
      <label>Message</label>
      <textarea name="message" rows="3" placeholder="Tell us about your event vision…"></textarea>
      <button type="submit" class="vel-btn-submit">SEND ENQUIRY</button>
    </form>
  `;

  const { close } = createModal(`modal-event-${eventName.replace(/\s/g,'-')}`, title, body);

  modalFormSubmit(
    $('#form-event-enquiry'),
    'velorisma_event_enquiries',
    (form) => {
      const { fname, lname, email, date, guests, message, eventType } = form.elements;
      return {
        id:        `EVT-${Date.now()}`,
        eventType: eventType.value,
        firstName: fname.value.trim(),
        lastName:  lname.value.trim(),
        email:     email.value.trim(),
        date:      date.value,
        guests:    guests.value,
        message:   message.value.trim(),
        timestamp: new Date().toISOString(),
      };
    },
    '✅ Enquiry sent! Our events team will contact you within 24 hours.',
    close
  );
};


/* ================================================================
   18. WIRE UP ALL BUTTONS
   Attaches click listeners to all the buttons across the page that
   open the various modals defined above.
   ================================================================ */
const initAllButtons = () => {

  $$('.learn-more').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openRestaurantLearnMore();
    });
  });

  $$('.btn-restaurant').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const text = btn.textContent.trim().toUpperCase();
      if (text.includes('MENU'))  openFullMenu();
      if (text.includes('TABLE')) openBookTable();
    });
  });

  $$('.learnMore').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openSpaLearnMore();
    });
  });

  $$('.spa-book').forEach(btn => {
    const text = btn.textContent.trim().toUpperCase();
    if (text.includes('SESSION')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openBookSpa();
      });
    }
  });

  $$('.event-card').forEach(card => {
    const viewMore = card.querySelector('.view-more');
    if (!viewMore) return;
    viewMore.addEventListener('click', (e) => {
      e.preventDefault();
      const eventName = card.querySelector('h3')?.textContent.trim().toUpperCase();
      openEventModal(eventName);
    });
  });
};


/* ================================================================
   19. TOAST NOTIFICATION
   Small pop-up message in the bottom-right corner, used throughout
   the file to give the user feedback (success/error/info).
   ================================================================ */
const showToast = (message, type = 'info') => {
  $('#velorisma-toast')?.remove();

  const colors = {
    success: { bg: '#2d6a4f', border: '#52b788' },
    error:   { bg: '#7b2d2d', border: '#e07070' },
    info:    { bg: '#2d4a6a', border: '#5288b7' },
  };
  const { bg, border } = colors[type] ?? colors.info;

  const toast = document.createElement('div');
  toast.id = 'velorisma-toast';
  toast.innerHTML = `<span>${message}</span>`;
  toast.style.cssText = `
    position:fixed;bottom:2rem;right:2rem;
    background:${bg};color:#fff;border:1px solid ${border};
    border-radius:12px;padding:1rem 1.6rem;
    font-family:'League Spartan',sans-serif;font-size:0.95rem;
    letter-spacing:0.05em;box-shadow:0 8px 32px rgba(0,0,0,0.3);
    z-index:999999;max-width:360px;animation:toastIn 0.35s ease forwards;
  `;

  if (!$('#toast-style')) {
    const style = document.createElement('style');
    style.id = 'toast-style';
    style.textContent = `
      @keyframes toastIn  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      @keyframes toastOut { from{opacity:1} to{opacity:0;transform:translateY(10px)} }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};


/* ================================================================
   20. PROFILE PANEL
   A slide-in side panel (like a drawer) that shows everything the
   user has saved locally: reservations, table bookings, spa
   sessions, event enquiries, and newsletter emails.
   ================================================================ */

const buildProfilePanel = () => {
  const panel = document.createElement('div');
  panel.id = 'profile-panel';
  panel.style.cssText = `
    position:fixed;top:0;right:-440px;width:420px;height:100vh;
    background:rgba(245,240,235,0.98);backdrop-filter:blur(16px);
    box-shadow:-8px 0 40px rgba(0,0,0,0.25);z-index:99990;
    display:flex;flex-direction:column;
    transition:right 0.4s cubic-bezier(0.23,1,0.32,1);overflow:hidden;
  `;
  panel.innerHTML = `
    <div style="padding:2rem 1.8rem 1rem;border-bottom:1px solid rgba(168,84,43,0.2);display:flex;justify-content:space-between;align-items:center;">
      <span style="font-family:'League Spartan',sans-serif;font-size:1.1rem;font-weight:700;letter-spacing:0.2em;color:#3d1a0a;">MY PROFILE</span>
      <button id="close-profile" style="background:none;border:none;font-size:1.6rem;cursor:pointer;color:#3d1a0a;">✕</button>
    </div>
    <div id="profile-content" style="flex:1;overflow-y:auto;padding:1.5rem 1.8rem;"></div>
  `;
  document.body.appendChild(panel);
  return panel;
};

const renderProfile = () => {
  const content = $('#profile-content');
  if (!content) return;

  const rooms   = JSON.parse(localStorage.getItem('velorisma_reservations')    ?? '[]');
  const tables  = JSON.parse(localStorage.getItem('velorisma_table_bookings')  ?? '[]');
  const spa     = JSON.parse(localStorage.getItem('velorisma_spa_bookings')    ?? '[]');
  const events  = JSON.parse(localStorage.getItem('velorisma_event_enquiries') ?? '[]');
  const emails  = JSON.parse(localStorage.getItem('velorisma_emails')          ?? '[]');

  const total = rooms.length + tables.length + spa.length + events.length + emails.length;

  if (total === 0) {
    content.innerHTML = `<p style="font-family:Lora,serif;font-size:0.9rem;color:#888;margin-top:1rem;text-align:center;">No saved data yet.<br>Make a booking to see it here!</p>`;
    return;
  }

  const sectionHTML = (label, items, rowFn) => items.length === 0 ? '' : `
    <div style="font-family:'League Spartan',sans-serif;font-size:0.72rem;font-weight:700;letter-spacing:0.25em;color:#a8542b;margin:1.2rem 0 0.6rem;">${label} (${items.length})</div>
    ${items.map(rowFn).join('')}
  `;

  const card = ({ left, right, sub }) => `
    <div style="background:#fff;border-radius:10px;padding:0.9rem 1.1rem;margin-bottom:0.6rem;border:1px solid rgba(168,84,43,0.12);box-shadow:0 2px 6px rgba(0,0,0,0.04);">
      <div style="display:flex;justify-content:space-between;margin-bottom:0.2rem;">
        <strong style="font-family:'League Spartan',sans-serif;font-size:0.78rem;color:#3d1a0a;">${left}</strong>
        <span style="font-size:0.65rem;color:#bbb;">${right}</span>
      </div>
      <div style="font-family:Lora,serif;font-size:0.76rem;color:#666;">${sub}</div>
    </div>
  `;

  content.innerHTML =
    sectionHTML('ROOM RESERVATIONS', rooms, r =>
      card({ left: `${r.firstName} ${r.lastName}`, right: new Date(r.timestamp).toLocaleDateString(), sub: `🏨 ${r.room || 'N/A'} ${r.checkin ? `· ${r.checkin} → ${r.checkout}` : ''} <span style="color:#a8542b;font-size:0.7rem;">· ${r.id}</span>` })
    ) +
    sectionHTML('TABLE BOOKINGS', tables, t =>
      card({ left: `${t.firstName} ${t.lastName}`, right: new Date(t.timestamp).toLocaleDateString(), sub: `🍽 ${t.date} at ${t.time} · ${t.guests} <span style="color:#a8542b;font-size:0.7rem;">· ${t.id}</span>` })
    ) +
    sectionHTML('SPA SESSIONS', spa, s =>
      card({ left: `${s.firstName} ${s.lastName}`, right: new Date(s.timestamp).toLocaleDateString(), sub: `🧖 ${s.treatment} · ${s.date} at ${s.time} <span style="color:#a8542b;font-size:0.7rem;">· ${s.id}</span>` })
    ) +
    sectionHTML('EVENT ENQUIRIES', events, ev =>
      card({ left: `${ev.firstName} ${ev.lastName}`, right: new Date(ev.timestamp).toLocaleDateString(), sub: `🎉 ${ev.eventType} · ${ev.date || 'TBD'} · ${ev.guests || '?'} guests <span style="color:#a8542b;font-size:0.7rem;">· ${ev.id}</span>` })
    ) +
    sectionHTML('NEWSLETTER', emails, e =>
      card({ left: '📧 ' + e, right: '', sub: 'Subscribed' })
    ) +
    `<button id="clear-storage" style="margin-top:1rem;background:transparent;border:1px solid rgba(168,84,43,0.4);border-radius:50px;padding:0.5rem 1.2rem;font-family:'League Spartan',sans-serif;font-size:0.75rem;letter-spacing:0.1em;color:#a8542b;cursor:pointer;">CLEAR ALL DATA</button>`;

  $('#clear-storage')?.addEventListener('click', () => {
    ['velorisma_reservations','velorisma_table_bookings','velorisma_spa_bookings','velorisma_event_enquiries','velorisma_emails']
      .forEach(k => localStorage.removeItem(k));
    renderProfile();
    showToast('🗑 All local data cleared.', 'info');
  });
};

const initProfilePanel = () => {
  const panel  = buildProfilePanel();
  const navCta = $('.nav-cta');
  if (!navCta) return;

  navCta.addEventListener('click', (e) => {
    e.preventDefault();
    panel.style.right = panel.style.right === '0px' ? '-440px' : '0px';
    renderProfile();
  });

  $('#close-profile')?.addEventListener('click', () => { panel.style.right = '-440px'; });

  document.addEventListener('click', (e) => {
    if (panel.style.right === '0px' && !panel.contains(e.target) && !navCta.contains(e.target)) {
      panel.style.right = '-440px';
    }
  });
};


/* ================================================================
   21. SCROLL REVEAL
   Fade/slide-in animation applied to cards as they scroll into view,
   using the IntersectionObserver API (efficient, no scroll-event
   polling needed).
   ================================================================ */
const initScrollReveal = () => {
  const style = document.createElement('style');
  style.textContent = `
    .reveal { opacity:0;transform:translateY(32px);transition:opacity 0.7s ease,transform 0.7s ease; }
    .reveal.visible { opacity:1;transform:translateY(0); }
  `;
  document.head.appendChild(style);

  const targets = $$('.room-card,.event-card,.info-card,.menu-cat-card,.spa-img-card');
  targets.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) { target.classList.add('visible'); observer.unobserve(target); }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => observer.observe(el));
};


/* ================================================================
   22. ACTIVE NAV LINK ON SCROLL
   Highlights the navigation link that corresponds to whichever
   section is currently in the middle of the viewport.
   ================================================================ */
const initActiveNav = () => {
  const sections = $$('section[id]');
  const links    = $$('.nav-links a, .mobile-nav-links a');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      links.forEach(link => {
        link.classList.toggle('active-nav', link.getAttribute('href') === `#${target.id}`);
      });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(sec => observer.observe(sec));

  const style = document.createElement('style');
  style.textContent = `.active-nav { color:rgb(151,51,18) !important; font-weight:700 !important; }`;
  document.head.appendChild(style);
};


/* ================================================================
   23. QUOTE OF THE DAY
   Fetches a random inspirational/travel quote from a public API to
   display on the "thank you" (post-booking) page.
   ================================================================ */

const fetchQuote = async () => {
  try {
    const res = await fetch('https://quoteslate.vercel.app/api/quotes/random?minLength=20&maxLength=120');
    if (!res.ok) throw new Error('failed');
    const { quote: content, author } = await res.json();
    return { content, author };
  } catch {
    return { content: 'The world is a book, and those who do not travel read only one page.', author: 'Saint Augustine' };
  }
};

const injectQuoteBanner = async () => {
  const thankyou = $('.thankyou-banner .container');
  if (!thankyou) return;

  const box = document.createElement('div');
  box.style.cssText = `max-width:700px;margin:0 auto 2rem;text-align:center;font-family:Lora,serif;font-style:italic;font-size:1.05rem;color:#3d1a0a;line-height:1.8;opacity:0;transition:opacity 0.8s;`;
  box.innerHTML = '<span>✦ Loading inspiration… ✦</span>';
  thankyou.insertBefore(box, thankyou.firstChild);

  const { content, author } = await fetchQuote();
  box.innerHTML = `<span style="font-size:1.4rem;color:#a8542b;">"</span>${content}<span style="font-size:1.4rem;color:#a8542b;">"</span><br><span style="font-style:normal;font-size:0.8rem;letter-spacing:0.15em;color:#888;">— ${author}</span>`;
  box.style.opacity = '1';
};


/* ================================================================
   24. EVENT LOGGER
   Tiny wrapper around console.log with a consistent "[VELORISMA]"
   prefix, used for debugging init order.
   ================================================================ */
const logEvent = (eventName, ...details) => {
  console.log(`[VELORISMA] ${eventName}:`, ...details);
};


/* ================================================================
   25. INIT
   Entry point: waits for the DOM to be fully parsed, then runs every
   init function in sequence to activate all the site's features.
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  logEvent('Init', 'Starting Velorisma JS modules');

  initHamburger();
  initStickyHeader();
  initRoomFilter();
  initRoomBookButtons();
  initReservationCalc();
  initReservationSubmit();
  initAvailabilityForm();
  initNewsletter();
  initAllButtons();
  initProfilePanel();
  initScrollReveal();
  initActiveNav();
  injectQuoteBanner();

  logEvent('Init', 'All modules loaded ✅');
});
