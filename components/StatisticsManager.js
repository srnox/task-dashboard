class StatisticsManager {
    constructor() {
        this.createStatisticsPanel();
        this.updateStatistics();
        
        // Update statistics every minute
        setInterval(() => this.updateStatistics(), 60000);
    }

    createStatisticsPanel() {
        const header = document.querySelector('.header');
        
        this.statsPanel = document.createElement('div');
        this.statsPanel.className = 'statistics-panel';
        
        header.appendChild(this.statsPanel);
    }

    updateStatistics() {
        const stats = TodoService.getStatistics();
        
        this.statsPanel.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-value">${stats.total}</span>
                    <span class="stat-label">Total Tasks</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${stats.completed}</span>
                    <span class="stat-label">Completed</span>
                </div>
                <div class="stat-item ${stats.overdue > 0 ? 'overdue' : ''}">
                    <span class="stat-value">${stats.overdue}</span>
                    <span class="stat-label">Overdue</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${((stats.completed / stats.total) * 100 || 0).toFixed(1)}%</span>
                    <span class="stat-label">Completion Rate</span>
                </div>
            </div>
            ${this.renderDetailedStats(stats)}
        `;

        // Add click handler for detailed stats toggle
        const detailsToggle = this.statsPanel.querySelector('.details-toggle');
        if (detailsToggle) {
            detailsToggle.addEventListener('click', () => {
                const detailedStats = this.statsPanel.querySelector('.detailed-stats');
                detailedStats.classList.toggle('show');
                detailsToggle.textContent = detailedStats.classList.contains('show') ? 'Hide Details' : 'Show Details';
            });
        }
    }

    renderDetailedStats(stats) {
        return `
            <button class="details-toggle">Show Details</button>
            <div class="detailed-stats">
                <div class="stats-section">
                    <h4>By Priority</h4>
                    ${Object.entries(stats.byPriority).map(([priority, count]) => `
                        <div class="stat-row">
                            <span class="priority-indicator" style="background: ${TodoService.priorities[priority].color}"></span>
                            <span>${TodoService.priorities[priority].label}</span>
                            <span>${count}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="stats-section">
                    <h4>By Category</h4>
                    ${Object.entries(stats.byCategory).map(([category, count]) => `
                        <div class="stat-row">
                            <span>${category}</span>
                            <span>${count}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="stats-section">
                    <h4>By Panel</h4>
                    ${Object.entries(stats.byPanel).map(([panel, count]) => `
                        <div class="stat-row">
                            <span>${panel.charAt(0).toUpperCase() + panel.slice(1).replace('-', ' ')}</span>
                            <span>${count}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}