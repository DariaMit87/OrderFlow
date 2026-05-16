// Quantity buttons and live order summary on create order page
(function () {
  const summaryList = document.getElementById('summary-list');
  const itemNames = {};

  document.querySelectorAll('.menu-item-card').forEach(card => {
    const increaseBtn = card.querySelector('[data-action="increase"]');
    const decreaseBtn = card.querySelector('[data-action="decrease"]');
    if (!increaseBtn) return;

    const id = increaseBtn.dataset.id;
    const input = document.getElementById(`qty-${id}`);
    const nameEl = card.querySelector('.item-name');
    if (nameEl) itemNames[id] = nameEl.textContent.trim();

    increaseBtn.addEventListener('click', () => {
      input.value = Math.min(20, parseInt(input.value) + 1);
      updateSummary();
    });

    decreaseBtn.addEventListener('click', () => {
      input.value = Math.max(0, parseInt(input.value) - 1);
      updateSummary();
    });
  });

  function updateSummary() {
    const items = [];
    document.querySelectorAll('.qty-input').forEach(input => {
      const qty = parseInt(input.value);
      const id = input.id.replace('qty-', '');
      if (qty > 0) items.push({ qty, name: itemNames[id] || id });
    });

    if (items.length === 0) {
      summaryList.innerHTML = '<p class="empty-msg">No items added yet.</p>';
    } else {
      summaryList.innerHTML = items.map(i =>
        `<div class="summary-item"><span>${i.qty}x ${i.name}</span></div>`
      ).join('');
    }
  }
})();
