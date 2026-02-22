/**
 * HealthTrack App Logic
 */

const state = {
    user: {
        name: 'Alex Johnson',
        phone: '',
        avatar: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=0ca5b0&color=fff'
    },
    reports: [
        { id: 1, title: 'Blood Test Results', date: 'Oct 24, 2023', hospital: 'City General', type: 'Lab' },
        { id: 2, title: 'Dental X-Ray', date: 'Sep 12, 2023', hospital: 'Smile Clinic', type: 'Radiology' },
        { id: 3, title: 'Annual Checkup', date: 'Aug 05, 2023', hospital: 'Dr. Smith', type: 'General' },
    ],
    hospitals: [
        { id: 1, name: 'City General Hospital', address: '123 Main St', rating: 4.8 },
        { id: 2, name: 'Valley Medical Center', address: '456 Oak Ave', rating: 4.5 },
    ]
};

const router = {
    container: document.getElementById('main-content'),
    nav: document.getElementById('bottom-nav'),
    scanner: document.getElementById('scanner-overlay'),

    init() {
        this.navigate('login');
    },

    navigate(viewName, data = null) {
        // Handle Navigation Bar Visibility
        if (viewName === 'login' || viewName === 'otp') {
            this.nav.classList.add('hidden');
        } else {
            this.nav.classList.remove('hidden');
            this.updateActiveNav(viewName);
        }

        // Render View
        this.container.innerHTML = '';
        const viewHtml = views[viewName](data);
        this.container.innerHTML = viewHtml;

        // Post-render hooks (listeners etc)
        if (viewName === 'otp') this.setupOtpInput();
    },

    updateActiveNav(viewName) {
        document.querySelectorAll('.nav-item').forEach(el => {
            el.classList.remove('text-primary');
            el.classList.add('text-gray-400');
        });
        const activeBtn = document.querySelector(`.nav-item[onclick*="'${viewName}'"]`);
        if (activeBtn) {
            activeBtn.classList.remove('text-gray-400');
            activeBtn.classList.add('text-primary');
        }
    },

    async openScanner() {
        // Check if running in a native environment with Capacitor and the ML Kit plugin
        if (window.Capacitor && window.Capacitor.Plugins.DocumentScanner) {
            try {
                const { DocumentScanner } = window.Capacitor.Plugins;
                const result = await DocumentScanner.scan({
                    maxNumPages: 1,
                    scannerMode: 'FULL', // FULL mode includes ML-enabled image cleaning
                    responseType: 'base64'
                });

                if (result.images && result.images.length > 0) {
                    const imgBase64 = `data:image/jpeg;base64,${result.images[0]}`;
                    this.saveScannedReport(imgBase64);
                }
            } catch (error) {
                console.error('Scan failed:', error);
                alert('Document scan failed. Falling back to standard camera.');
                this.openLegacyScanner();
            }
        } else {
            // Fallback for browser/mock testing
            this.openLegacyScanner();
        }
    },

    openLegacyScanner() {
        this.scanner.classList.remove('hidden');
    },

    saveScannedReport(base64Data) {
        // In a real app, you'd upload this to a server. 
        // Here we just add it to the state to demonstrate.
        this.addReport({
            title: 'Smart Scanned Report',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            hospital: 'ML Kit Processed',
            type: 'Scan',
            preview: base64Data
        });
        alert("Document captured and cleaned by ML Kit! Added to reports.");
        this.navigate('reports');
    },

    closeScanner() {
        this.scanner.classList.add('hidden');
        // Reset preview
        document.getElementById('scanned-image-preview').classList.add('hidden');
        document.getElementById('scanned-image-preview').src = '';
        document.getElementById('camera-placeholder').classList.remove('hidden');
    },

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imgUrl = e.target.result;
                document.getElementById('camera-placeholder').classList.add('hidden');
                const previewImg = document.getElementById('scanned-image-preview');
                previewImg.src = imgUrl;
                previewImg.classList.remove('hidden');

                // Mock "Scanning" process
                setTimeout(() => {
                    const confirmSave = confirm("Document scanned successfully! Save to Reports?");
                    if (confirmSave) {
                        this.addReport({
                            title: 'New Scanned Document',
                            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                            hospital: 'Unknown Source',
                            type: 'Scan'
                        });
                        this.closeScanner();
                        this.navigate('reports');
                    }
                }, 1000);
            };
            reader.readAsDataURL(file);
        }
    },

    addReport(report) {
        state.reports.unshift(report);
    },

    setupOtpInput() {
        const inputs = document.querySelectorAll('.otp-input');
        inputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                if (e.target.value.length === 1) {
                    if (index < inputs.length - 1) inputs[index + 1].focus();
                }
            });
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && e.target.value === '') {
                    if (index > 0) inputs[index - 1].focus();
                }
            });
        });
    }
};

const views = {
    login: () => `
        <div class="h-full flex flex-col items-center justify-center p-8 bg-white animate-fade-in">
            <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <i class="fas fa-heartbeat text-4xl text-primary"></i>
            </div>
            <h1 class="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p class="text-gray-500 mb-8 text-center text-sm">Enter your mobile number to access your health records</p>
            
            <div class="w-full space-y-4">
                <div class="relative">
                    <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"><i class="fas fa-phone"></i></span>
                    <input type="tel" placeholder="+1 (555) 000-0000" class="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary/50 text-gray-800 font-medium">
                </div>
                <button onclick="router.navigate('otp')" class="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/30 active-scale transition-all">
                    Send OTP
                </button>
            </div>
            
            <p class="mt-8 text-xs text-center text-gray-400">By continuing, you agree to our Terms & Privacy Policy</p>
        </div>
    `,

    otp: () => `
        <div class="h-full flex flex-col p-8 bg-white animate-slide-in">
            <button onclick="router.navigate('login')" class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 mb-8 hover:bg-gray-100">
                <i class="fas fa-arrow-left"></i>
            </button>
            
            <h1 class="text-2xl font-bold text-gray-800 mb-2">Verification</h1>
            <p class="text-gray-500 mb-8 text-sm">We sent a 4-digit code to your number. <br> <span class="text-primary font-medium">Edit number</span></p>
            
            <div class="flex justify-between gap-4 mb-8">
                <input type="text" maxlength="1" class="otp-input w-14 h-16 rounded-xl bg-gray-50 text-center text-2xl font-bold text-gray-800 focus:bg-white border-2 border-transparent focus:border-primary transition-all">
                <input type="text" maxlength="1" class="otp-input w-14 h-16 rounded-xl bg-gray-50 text-center text-2xl font-bold text-gray-800 focus:bg-white border-2 border-transparent focus:border-primary transition-all">
                <input type="text" maxlength="1" class="otp-input w-14 h-16 rounded-xl bg-gray-50 text-center text-2xl font-bold text-gray-800 focus:bg-white border-2 border-transparent focus:border-primary transition-all">
                <input type="text" maxlength="1" class="otp-input w-14 h-16 rounded-xl bg-gray-50 text-center text-2xl font-bold text-gray-800 focus:bg-white border-2 border-transparent focus:border-primary transition-all">
            </div>
            
            <button onclick="router.navigate('dashboard')" class="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/30 active-scale transition-all mb-6">
                Verify & Login
            </button>
            
           <p class="text-center text-sm text-gray-500">Didn't receive code? <span class="text-primary font-bold cursor-pointer">Resend</span></p>
        </div>
    `,

    dashboard: () => `
        <div class="pb-24 animate-fade-in">
            <!-- Header -->
            <div class="bg-primary pt-8 pb-16 px-6 rounded-b-[2.5rem] shadow-xl relative z-10">
                <div class="flex justify-between items-center mb-6">
                    <div class="flex items-center space-x-3">
                        <img src="${state.user.avatar}" class="w-10 h-10 rounded-full border-2 border-white/30">
                        <div class="text-white">
                            <p class="text-xs opacity-80">Hello,</p>
                            <h3 class="font-bold text-lg leading-tight tracking-wide">${state.user.name}</h3>
                        </div>
                    </div>
                    <button class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-sm">
                        <i class="fas fa-bell"></i>
                    </button>
                </div>
                
                <!-- Search -->
                <div class="relative">
                    <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary"><i class="fas fa-search"></i></span>
                    <input type="text" placeholder="Search records, doctors..." class="w-full pl-12 pr-4 py-3 bg-white rounded-xl border-none shadow-sm focus:ring-0 text-sm">
                </div>
            </div>

            <!-- Main Menu Grid -->
            <div class="px-6 -mt-8 grid grid-cols-2 gap-4">
                <div onclick="router.navigate('hospitals')" class="bg-white p-4 rounded-2xl shadow-lg premium-shadow flex flex-col items-center justify-center gap-3 h-32 active-scale cursor-pointer">
                    <div class="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
                        <i class="fas fa-hospital-alt"></i>
                    </div>
                    <span class="font-semibold text-gray-700 text-sm">Hospitals</span>
                </div>
                <div onclick="router.navigate('reports')" class="bg-white p-4 rounded-2xl shadow-lg premium-shadow flex flex-col items-center justify-center gap-3 h-32 active-scale cursor-pointer">
                    <div class="w-12 h-12 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-xl">
                        <i class="fas fa-file-medical-alt"></i>
                    </div>
                    <span class="font-semibold text-gray-700 text-sm">Reports</span>
                </div>
                <div onclick="router.navigate('diseases')" class="bg-white p-4 rounded-2xl shadow-lg premium-shadow flex flex-col items-center justify-center gap-3 h-32 active-scale cursor-pointer">
                    <div class="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xl">
                        <i class="fas fa-bacteria"></i>
                    </div>
                    <span class="font-semibold text-gray-700 text-sm">Diseases</span>
                </div>
                <div onclick="router.navigate('bills')" class="bg-white p-4 rounded-2xl shadow-lg premium-shadow flex flex-col items-center justify-center gap-3 h-32 active-scale cursor-pointer">
                    <div class="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xl">
                        <i class="fas fa-wallet"></i>
                    </div>
                    <span class="font-semibold text-gray-700 text-sm">Med Bills</span>
                </div>
            </div>

            <!-- Recent Reports Section -->
            <div class="px-6 mt-8">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold text-gray-800">Recent Reports</h3>
                    <span class="text-xs text-primary font-bold cursor-pointer" onclick="router.navigate('reports')">See All</span>
                </div>
                
                <div class="space-y-3">
                    ${state.reports.slice(0, 2).map(report => `
                        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div class="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                <i class="fas fa-file-alt"></i>
                            </div>
                            <div class="flex-1">
                                <h4 class="font-bold text-gray-800 text-sm">${report.title}</h4>
                                <p class="text-xs text-gray-500">${report.date} • ${report.hospital}</p>
                            </div>
                            <button class="text-gray-300 hover:text-primary"><i class="fas fa-chevron-right"></i></button>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `,

    reports: () => `
        <div class="pb-24 h-full flex flex-col animate-slide-in">
            <div class="pt-12 px-6 pb-6 bg-white border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900">Medical Reports</h1>
                    <p class="text-gray-400 text-sm">All your digital records in one place</p>
                </div>
                <button onclick="router.openScanner()" class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                    <i class="fas fa-plus text-lg"></i>
                </button>
            </div>
            
            <div class="flex-1 overflow-y-auto p-6 space-y-4">
                ${state.reports.map(report => `
                    <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div class="w-12 h-12 rounded-xl ${report.type === 'Lab' ? 'bg-blue-100 text-blue-600' : report.type === 'Radiology' ? 'bg-orange-100 text-orange-600' : 'bg-teal-100 text-teal-600'} flex items-center justify-center text-xl overflow-hidden">
                            ${report.preview ? `<img src="${report.preview}" class="w-full h-full object-cover">` : `<i class="fas ${report.type === 'Scan' ? 'fa-camera' : 'fa-file-medical'}"></i>`}
                        </div>
                        <div class="flex-1">
                            <h4 class="font-bold text-gray-800 flex items-center gap-2">
                                ${report.title}
                                ${report.hospital === 'ML Kit Processed' ? '<span class="text-[8px] bg-primary text-white px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Smart</span>' : ''}
                            </h4>
                            <p class="text-xs text-gray-500">${report.date}</p>
                            <span class="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full font-medium">${report.hospital}</span>
                        </div>
                        <button class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-200">
                            <i class="fas fa-download text-xs"></i>
                        </button>
                    </div>
                `).join('')}
                
                ${state.reports.length === 0 ? `
                    <div class="text-center py-20 opacity-50">
                        <i class="fas fa-folder-open text-4xl mb-4 text-gray-300"></i>
                        <p class="text-gray-500">No reports found</p>
                    </div>
                ` : ''}
            </div>
        </div>
    `,

    hospitals: () => `
        <div class="pb-24 h-full flex flex-col animate-slide-in">
             <div class="pt-12 px-6 pb-6 bg-white border-b border-gray-100">
                <h1 class="text-2xl font-bold text-gray-900">Nearby Hospitals</h1>
            </div>
            <div class="p-6 space-y-4 overflow-y-auto">
                ${state.hospitals.map(hospital => `
                    <div class="bg-white rounded-2xl overflow-hidden shadow-lg premium-shadow mb-4">
                        <div class="h-32 bg-gray-200 relative">
                            <!-- Placeholder Map/Image -->
                            <div class="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-100">
                                <i class="fas fa-map-marker-alt text-3xl"></i>
                            </div>
                            <div class="absolute top-3 right-3 bg-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                                <i class="fas fa-star text-yellow-400"></i> ${hospital.rating}
                            </div>
                        </div>
                        <div class="p-4">
                            <h3 class="font-bold text-lg text-gray-800">${hospital.name}</h3>
                            <p class="text-gray-500 text-sm mb-3"><i class="fas fa-map-pin mr-1 text-primary"></i> ${hospital.address}</p>
                            <div class="flex gap-2">
                                <button class="flex-1 py-2 bg-primary/10 text-primary rounded-lg font-medium text-sm">Call Now</button>
                                <button class="flex-1 py-2 bg-primary text-white rounded-lg font-medium text-sm">Directions</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `,

    diseases: () => `
        <div class="pb-24 h-full flex flex-col animate-slide-in">
            <div class="pt-12 px-6 pb-6 bg-white border-b border-gray-100">
                <h1 class="text-2xl font-bold text-gray-900">Disease Info</h1>
            </div>
             <div class="p-6 flex flex-col items-center justify-center flex-1">
                <div class="text-center">
                    <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-virus text-3xl text-red-500"></i>
                    </div>
                     <h3 class="text-lg font-bold text-gray-700">Disease Encyclopedia</h3>
                    <p class="text-gray-500 text-sm mt-2 px-8">This section will contain a searchable database of diseases and symptoms.</p>
                </div>
            </div>
        </div>
    `,

    bills: () => `
         <div class="pb-24 h-full flex flex-col animate-slide-in">
            <div class="pt-12 px-6 pb-6 bg-white border-b border-gray-100">
                <h1 class="text-2xl font-bold text-gray-900">Medical Bills</h1>
            </div>
             <div class="p-6 flex flex-col items-center justify-center flex-1">
                <div class="text-center">
                    <div class="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-file-invoice-dollar text-3xl text-purple-500"></i>
                    </div>
                     <h3 class="text-lg font-bold text-gray-700">No Pending Bills</h3>
                    <p class="text-gray-500 text-sm mt-2 px-8">Great! You have no outstanding payments.</p>
                </div>
            </div>
        </div>
    `,
};

// Start App
router.init();
