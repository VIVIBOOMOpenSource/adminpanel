import React from 'react';
import './pagination.scss';

function Pagination({
  page, totalPages, setPage, scrollToRef,
}) {
  const before = 2;
  let after = 2;
  let items = [];

  let beforeItem = page - before;
  if (page + after > totalPages) {
    beforeItem += totalPages - (page + after);
  }
  while (beforeItem < page) {
    if (beforeItem <= 0) {
      after += 1;
    } else {
      items.push(beforeItem);
    }
    beforeItem += 1;
  }

  items.push(page);

  let afterItem = 1;
  while (afterItem <= after && afterItem + page <= totalPages) {
    items.push(page + afterItem);
    afterItem += 1;
  }

  // First
  if (items.indexOf(1) === -1) {
    items.unshift(1);
  }
  // Last
  if (items.indexOf(totalPages) === -1) {
    items.push(totalPages);
  }

  if (items.length >= 6) {
    if (items[1] - items[0] > 1) {
      items = [items[0], '...', ...items.slice(1)];
    }

    if (items[items.length - 1] - items[items.length - 2] > 1) {
      items = [...items.slice(0, items.length - 2), '...', items[items.length - 1]];
    }
  }

  return (
    <div className="pagination hlo">
      {items.map((v, index) => {
        if (v === 0) return '';

        if (v === '...') {
          return <div key={`pagination-dots_${index}`}>{v}</div>;
        }

        return (
          <div
            className={v === page ? 'active' : ''}
            onClick={() => {
              setPage(v);
              (scrollToRef ?? document.querySelector('thead'))?.scrollIntoView({ behavior: 'smooth' });
            }}
            key={`pagination-${v}`}
          >
            {v}
          </div>
        );
      })}
    </div>
  );
}

export default Pagination;
