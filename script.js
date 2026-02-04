// Data simulasi (gunakan localStorage untuk persistensi)
let visits = JSON.parse(localStorage.getItem('visits')) || [];
let borrowedBooks = [ // Contoh data buku pinjam
    { nama: 'Siswa A', buku: 'Matematika Dasar', durasi: '1 Minggu', kelas: 'XII IPA 1' },
    { nama: 'Siswa B', buku: 'Buku Paket Fisika', durasi: '1 Jam Pelajaran', kelas: 'XI IPS 2' },
    // Tambah lebih banyak jika perlu
];
let requests = JSON.parse(localStorage.getItem('requests')) || [];
let isAdminLoggedIn = false;

// Tampilkan hari dan selamat datang
document.addEventListener('DOMContentLoaded', () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const today = new Date();
    document.getElementById('current-day').textContent = `${days[today.getDay()]}, ${today.toLocaleDateString('id-ID')}`;
    showSection('home');
    loadVisitsTable();
});

// Fungsi tampilkan section
function showSection(sectionId) {
    document.querySelectorAll('section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    if (sectionId === 'admin' && !isAdminLoggedIn) {
        showSection('login');
    } else if (sectionId === 'admin') {
        document.getElementById('admin').style.display = 'block';
    }
}

// Login Admin
document.getElementById('admin-login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (username === 'Marko' && password === '20203740') {
        isAdminLoggedIn = true;
        showSection('admin');
        document.getElementById('login-error').textContent = '';
    } else {
        document.getElementById('login-error').textContent = 'Username atau Password salah!';
    }
});

// Logout Admin
function logoutAdmin() {
    isAdminLoggedIn = false;
    document.getElementById('admin').style.display = 'none';
    showSection('home');
}

// Load Daftar Buku Pinjam (Siswa)
function loadBorrowedBooks() {
    const kelasFilter = document.getElementById('kelas').value.toUpperCase();
    const tbody = document.querySelector('#borrowed-books-table tbody');
    tbody.innerHTML = '';
    borrowedBooks.filter(book => !kelasFilter || book.kelas.toUpperCase().includes(kelasFilter)).forEach(book => {
        const row = `<tr><td>${book.nama}</td><td>${book.buku}</td><td>${book.durasi}</td><td>${book.kelas}</td></tr>`;
        tbody.innerHTML += row;
    });
}

// Request Form (Anonym)
document.getElementById('request-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const text = document.getElementById('request-text').value;
    requests.push({ text, date: new Date().toLocaleString() });
    localStorage.setItem('requests', JSON.stringify(requests));
    document.getElementById('request-success').textContent = 'Request/Saran berhasil dikirim!';
    document.getElementById('request-text').value = '';
    // Di production, kirim ke email atau DB, tapi di sini simpan local
});

// Tambah Kunjungan
function addVisit() {
    document.getElementById('add-visit-form').style.display = 'block';
}

function saveVisit() {
    const date = document.getElementById('visit-date').value;
    const name = document.getElementById('visit-name').value;
    const gender = document.getElementById('visit-gender').value;
    const purpose = document.getElementById('visit-purpose').value;
    visits.push({ date, name, gender, purpose });
    localStorage.setItem('visits', JSON.stringify(visits));
    loadVisitsTable();
    document.getElementById('add-visit-form').style.display = 'none';
}

// Load Tabel Kunjungan
function loadVisitsTable() {
    const tbody = document.querySelector('#visits-table tbody');
    tbody.innerHTML = '';
    visits.forEach(visit => {
        const row = `<tr><td>${visit.date}</td><td>${visit.name}</td><td>${visit.gender}</td><td>${visit.purpose}</td></tr>`;
        tbody.innerHTML += row;
    });
}

// Ekspor ke Excel
function exportToExcel() {
    const ws = XLSX.utils.json_to_sheet(visits);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Kunjungan');
    XLSX.writeFile(wb, 'laporan_kunjungan.xlsx');
}

// Impor dari Excel
function importFromExcel() {
    document.getElementById('import-file').click();
    document.getElementById('import-file').onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = evt.target.result;
            const wb = XLSX.read(data, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            visits = XLSX.utils.sheet_to_json(ws, { header: ['date', 'name', 'gender', 'purpose'] }).slice(1); // Skip header
            localStorage.setItem('visits', JSON.stringify(visits));
            loadVisitsTable();
        };
        reader.readAsBinaryString(file);
    };
}

// Hapus Semua
function clearVisits() {
    if (confirm('Yakin hapus semua data kunjungan?')) {
        visits = [];
        localStorage.setItem('visits', JSON.stringify(visits));
        loadVisitsTable();
    }
}