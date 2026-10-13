(() => {
  const game = document.querySelector('#case-game');
  const query = document.querySelector('#case-query');
  const cards = [...document.querySelectorAll('.case')];
  const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase();
  function filter() {
    let shown = 0;
    for (const card of cards) {
      card.hidden = (game.value !== 'all' && card.dataset.game !== game.value) || !normalize(card.textContent).includes(normalize(query.value));
      if (!card.hidden) shown++;
    }
    document.querySelector('#case-count').textContent = `${shown} / ${cards.length} case đang hiển thị. Case tính từ mã được ghi riêng với quan sát trên thiết bị.`;
  }
  game.addEventListener('change', filter);
  query.addEventListener('input', filter);
  filter();
})();
