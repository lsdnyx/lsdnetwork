document.addEventListener('DOMContentLoaded', () => {
    
    // --- Main Sidebar Navigation ---
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active to clicked
            item.classList.add('active');

            // Hide all pages
            pages.forEach(page => page.classList.remove('active'));
            
            // Show target page
            const targetId = `page-${item.dataset.target}`;
            const targetPage = document.getElementById(targetId);
            if(targetPage) targetPage.classList.add('active');
        });
    });

    // --- Settings Sub-Navigation ---
    const setTabs = document.querySelectorAll('.set-tab');
    const setPanels = document.querySelectorAll('.set-panel');

    setTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all setting tabs
            setTabs.forEach(t => t.classList.remove('active'));
            // Add active to clicked
            tab.classList.add('active');

            // Hide all setting panels
            setPanels.forEach(panel => panel.classList.remove('active'));
            
            // Show target panel
            const targetPanelId = `set-${tab.dataset.set}`;
            const targetPanel = document.getElementById(targetPanelId);
            if(targetPanel) targetPanel.classList.add('active');
        });
    });

    // --- Mock Segmented Control Interactions (for visual effect) ---
    const segmentedControls = document.querySelectorAll('.segmented-control');
    segmentedControls.forEach(control => {
        const buttons = control.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active from siblings
                buttons.forEach(b => b.classList.remove('active'));
                // Add active to clicked
                btn.classList.add('active');
            });
        });
    });

});
