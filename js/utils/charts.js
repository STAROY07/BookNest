/**
 * BookNest SVG Charting Engine for Admin Analytics & Reports
 * Zero dependencies, highly performant, responsive SVG charts.
 */

const BookNestCharts = {
  /**
   * Render Responsive SVG Bar Chart (e.g. Monthly Revenue)
   */
  renderBarChart(containerId, data = [], options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!data.length) {
      container.innerHTML = `<div class="empty-state"><p>No analytics data available for this range.</p></div>`;
      return;
    }

    const maxVal = Math.max(...data.map(d => d.value), 100);
    const height = options.height || 240;
    const barWidth = 40;
    const gap = 24;
    const width = data.length * (barWidth + gap) + 60;

    let barsSvg = '';
    data.forEach((item, index) => {
      const x = 40 + index * (barWidth + gap);
      const barHeight = (item.value / maxVal) * (height - 60);
      const y = height - 40 - barHeight;

      barsSvg += `
        <g class="chart-bar-group">
          <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="4" fill="#2d6a4f">
            <title>${item.label}: ₹${item.value.toLocaleString()}</title>
          </rect>
          <text x="${x + barWidth / 2}" y="${y - 8}" text-anchor="middle" font-size="11" font-weight="700" fill="#1b4332">₹${item.value >= 1000 ? (item.value/1000).toFixed(1) + 'k' : item.value}</text>
          <text x="${x + barWidth / 2}" y="${height - 20}" text-anchor="middle" font-size="11" font-weight="500" fill="#526058">${item.label}</text>
        </g>
      `;
    });

    container.innerHTML = `
      <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" style="overflow: visible;">
        <line x1="20" y1="${height - 40}" x2="${width - 20}" y2="${height - 40}" stroke="#e2e8e3" stroke-width="1.5" />
        ${barsSvg}
      </svg>
    `;
  },

  /**
   * Render Responsive SVG Donut / Category Distribution Chart
   */
  renderDonutChart(containerId, data = [], options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const total = data.reduce((sum, d) => sum + d.value, 0);
    if (total === 0) {
      container.innerHTML = `<div class="empty-state"><p>No category distribution recorded.</p></div>`;
      return;
    }

    const size = options.size || 220;
    const radius = 75;
    const strokeWidth = 26;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;

    const colors = ['#1b4332', '#40916c', '#52b788', '#c49a45', '#74c69d', '#1d4ed8', '#d97706'];

    let currentAngle = 0;
    let paths = '';
    let legendHtml = '<div class="d-flex flex-column gap-2" style="margin-left: 1.5rem;">';

    data.forEach((item, idx) => {
      const color = colors[idx % colors.length];
      const strokeDashoffset = circumference - (item.value / total) * circumference;
      const rotation = (currentAngle / total) * 360;

      paths += `
        <circle cx="${center}" cy="${center}" r="${radius}" fill="transparent"
                stroke="${color}" stroke-width="${strokeWidth}"
                stroke-dasharray="${circumference}" stroke-dashoffset="${strokeDashoffset}"
                transform="rotate(${rotation - 90} ${center} ${center})">
          <title>${item.label}: ${item.value} (${((item.value/total)*100).toFixed(1)}%)</title>
        </circle>
      `;

      legendHtml += `
        <div class="d-flex align-center gap-2" style="font-size: 0.85rem;">
          <span style="width: 12px; height: 12px; background: ${color}; border-radius: 3px; display: inline-block;"></span>
          <span style="font-weight: 500;">${item.label}</span>
          <span style="color: var(--color-text-muted); margin-left: auto;">${item.value}</span>
        </div>
      `;

      currentAngle += item.value;
    });

    legendHtml += '</div>';

    container.innerHTML = `
      <div class="d-flex align-center justify-center flex-wrap" style="padding: 1rem 0;">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          ${paths}
          <text x="${center}" y="${center + 4}" text-anchor="middle" font-size="14" font-weight="700" fill="#1b4332">Total ${total}</text>
        </svg>
        ${legendHtml}
      </div>
    `;
  }
};

window.BookNestCharts = BookNestCharts;
