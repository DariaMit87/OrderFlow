(function () {
  const summaryList  = document.getElementById('summary-list');
  const summaryTotal = document.getElementById('summary-total');
  const totalValue   = document.getElementById('summary-total-value');
  const itemNames    = {};
  const itemPrices   = {};

  // Read each menu item's name and price from the DOM into lookup objects
  document.querySelectorAll('.menu-item-row').forEach(row => {
    const increaseBtn = row.querySelector('[data-action="increase"]');
    const decreaseBtn = row.querySelector('[data-action="decrease"]');
    if (!increaseBtn) return;

    const id    = increaseBtn.dataset.id;
    const input = document.getElementById(`qty-${id}`);
    const nameEl = row.querySelector('.menu-item-name');

    if (nameEl)  itemNames[id]  = nameEl.textContent.trim();
    if (input)   itemPrices[id] = parseFloat(input.dataset.price) || 0;

    increaseBtn.addEventListener('click', () => {
      input.value = Math.min(20, parseInt(input.value) + 1);
      updateSummary();
    });
    decreaseBtn.addEventListener('click', () => {
      input.value = Math.max(0, parseInt(input.value) - 1);
      updateSummary();
    });
  });

  // Count total price of order
  function updateSummary() {
    const items = [];
    let total = 0;

    document.querySelectorAll('.qty-input').forEach(input => {
      const qty   = parseInt(input.value);
      const id    = input.id.replace('qty-', '');
      const price = itemPrices[id] || 0;
      if (qty > 0) {
        items.push({ qty, name: itemNames[id] || id, lineTotal: price * qty });
        total += price * qty;
      }
    });

    if (items.length === 0) {
      summaryList.innerHTML = '<p class="summary-empty">No items added yet.</p>';
      summaryTotal.style.display = 'none';
    } else {
      summaryList.innerHTML = items.map(i =>
        `<div class="summary-row">
          <span>${i.qty}x ${i.name}</span>
          <span>€${i.lineTotal.toFixed(2)}</span>
        </div>`
      ).join('');
      totalValue.textContent = `€${total.toFixed(2)}`;
      summaryTotal.style.display = 'flex';
    }
  }
})();
