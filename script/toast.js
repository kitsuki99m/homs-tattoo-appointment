export function showToast(message, type = 'success') {
     if (document.querySelector(".toast")) return; // prevent duplicates
    const container = document.getElementById('toast-container');
    

    const colors = {
        success: 'border-success bg-[#f5f5f5] text-text-primary',
        error: 'border-danger bg-[#f5f5f5] text-text-primary',
        info: 'border-gold bg-[#f5f5f5] text-text-primary',
    };

    const icons = {
        success: 'checkmark-circle-outline',
        error: 'close-circle-outline',
        info: 'information-circle-outline',
    };

    const toast = document.createElement('div');
    toast.className = `
        flex items-center gap-3 px-4 py-3
        border-l-4 ${colors[type]}
        shadow-lg min-w-[260px] max-w-[360px] 
        translate-x-full opacity-0 transition-all duration-300
    `;

    toast.innerHTML = `
        <ion-icon name="${icons[type]}" class="text-gold text-2xl flex-shrink-0"></ion-icon>
        <p class="text-sm flex-1">${message}</p>
        <button class="text-text-muted hover:text-text-primary ml-2">
            <ion-icon name="close-outline"></ion-icon>
        </button>
    `;

    container.appendChild(toast);

    // animate in
    requestAnimationFrame(() => {
        toast.classList.remove('translate-x-full', 'opacity-0');
        toast.classList.add('translate-x-0', 'opacity-100');
    });

    // close button
    toast.querySelector('button').addEventListener('click', () => {
        removeToast(toast);
    });

    // auto remove after 3 seconds
    setTimeout(() => removeToast(toast), 2000);
}

function removeToast(toast) {
    toast.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
}