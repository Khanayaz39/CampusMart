// ============================================
// CampusMart — Create Listing Script
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    protectPage();

    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview-container');
    let uploadedFiles = [];

    dropZone?.addEventListener('click', () => fileInput.click());

    const preventDefaults = (e) => { e.preventDefault(); e.stopPropagation(); };
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(ev => dropZone?.addEventListener(ev, preventDefaults, false));
    ['dragenter', 'dragover'].forEach(ev => dropZone?.addEventListener(ev, () => dropZone.classList.add('dragover'), false));
    ['dragleave', 'drop'].forEach(ev => dropZone?.addEventListener(ev, () => dropZone.classList.remove('dragover'), false));

    dropZone?.addEventListener('drop', (e) => handleFiles(e.dataTransfer.files));
    fileInput?.addEventListener('change', (e) => handleFiles(e.target.files));

    const INAPPROPRIATE_FILENAME_REGEX = /(nude|naked|nsfw|xxx|porn|sex|adult|boobs|dick|pussy|penis|vagina|erotic|vape|weed|alcohol|beer|whiskey|gun|pistol|knife|blade|fuck|bitch|madarchod|bhenchod|chutiya|gandu)/i;

    function handleFiles(files) {
        [...files].forEach(file => {
            if (!file.type.startsWith('image/')) return;
            if (file.name && INAPPROPRIATE_FILENAME_REGEX.test(file.name)) {
                showToast(`🛡️ Photo blocked: "${file.name}" violates campus safety guidelines (prohibited or adult content).`, 'error');
                return;
            }
            if (uploadedFiles.length >= 5) {
                showToast('Maximum 5 images allowed', 'warning');
                return;
            }
            uploadedFiles.push(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                const div = document.createElement('div');
                div.className = 'preview-item animate-scale-in';
                div.style.cssText = 'width: 76px; height: 76px; border-radius: 10px; overflow: hidden; position: relative; border: 1px solid var(--border);';
                div.innerHTML = `
                    <img src="${e.target.result}" alt="preview" style="width: 100%; height: 100%; object-fit: cover;">
                    <button type="button" class="remove-btn" style="position: absolute; top: 2px; right: 2px; width: 22px; height: 22px; border-radius: 50%; background: rgba(239, 68, 68, 0.9); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.7rem;"><i class="fas fa-times"></i></button>
                `;
                div.querySelector('.remove-btn').addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    div.remove();
                    uploadedFiles = uploadedFiles.filter(f => f !== file);
                });
                previewContainer?.appendChild(div);
            };
            reader.readAsDataURL(file);
        });
    }

    document.getElementById('create-listing-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const titleVal = document.getElementById('title').value.trim();
        const descVal = document.getElementById('description').value.trim();

        if (GLOBAL_PROFANITY_REGEX.test(titleVal) || GLOBAL_PROFANITY_REGEX.test(descVal)) {
            showToast('🛡️ Post blocked: Inappropriate words or swears (English/Hindi) are strictly prohibited.', 'error');
            return;
        }

        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Publishing to CampusMart...';
        btn.disabled = true;

        const formData = new FormData();
        formData.append('title', titleVal);
        formData.append('price', document.getElementById('price').value.trim());
        formData.append('condition', document.getElementById('condition').value);
        formData.append('category', document.getElementById('category').value);
        formData.append('description', descVal);

        const hostelVal = document.getElementById('hostel')?.value.trim();
        if (hostelVal) formData.append('hostel', hostelVal);

        const negotiableVal = document.getElementById('negotiable')?.checked;
        formData.append('negotiable', negotiableVal ? 'true' : 'false');
        uploadedFiles.forEach(file => formData.append('images', file));

        try {
            const token = getToken();
            const res = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                body: formData
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                const err = new Error(errData.message || 'Failed to post listing');
                err.status = res.status;
                err.violationType = errData.violationType;
                err.isModeration = !!(errData.violationType || (res.status === 400 && (errData.message?.includes('🛡️') || errData.message?.includes('blocked') || errData.message?.includes('prohibited'))));
                throw err;
            }

            const newProduct = await res.json();
            saveLocalUserListing(newProduct);
            showToast('🎉 Your listing is live on CampusMart!', 'success');
            setTimeout(() => { window.location.href = `/product-detail.html?id=${newProduct._id}`; }, 1000);
        } catch (error) {
            btn.innerHTML = originalText;
            btn.disabled = false;
            showToast(error.message || 'Network error while posting listing', 'error');
        }
    });
});

const LISTING_TEMPLATES = {
    book: "Semester textbook in great condition.\n• Edition: Latest\n• Notes & Highlighting: Clean pages, no missing chapters\n• Pickup: Can hand over near hostel common area or college gate.",
    laptop: "Tested and fully functional.\n• Usage: Used for 2 college semesters\n• Included Accessories: Original charger and protective case\n• Reason for selling: Upgraded device\n• Pickup: Available to test and inspect in room.",
    cycle: "Geared bicycle in smooth riding condition.\n• Gears: Smooth shifting, brakes working reliably\n• Tires: Good condition, ready to ride\n• Accessories: Includes lock and bell\n• Pickup: Can inspect and test ride at hostel cycle stand."
};

window.insertTemplate = (type) => {
    const descArea = document.getElementById('description');
    if (!descArea || !LISTING_TEMPLATES[type]) return;
    descArea.value = LISTING_TEMPLATES[type];
    showToast('Template added to description!', 'info');
};
