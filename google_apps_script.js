/**
 * GOOGLE APPS SCRIPT - KONEKSI UNDANGAN PERNIKAHAN KE SPREADSHEET (VERSI BULLETPROOF / CORS-IMMUNE)
 * 
 * Petunjuk Penggunaan:
 * 1. Buka Google Sheets baru atau yang sudah ada.
 * 2. Pada baris pertama (Header), buat kolom berikut:
 *    A1: Timestamp
 *    B1: Nama
 *    C1: Kehadiran
 *    D1: Jumlah Tamu
 *    E1: Ucapan
 * 3. Buka menu Ekstensi > Apps Script.
 * 4. Hapus semua kode default, lalu salin dan tempel (paste) kode di bawah ini.
 * 5. Klik ikon simpan (Save).
 * 6. Klik tombol "Terapkan" (Deploy) > "Kelola Penerapan" (Manage Deployments).
 *    *SANGAT PENTING*: Setiap kali Anda memperbarui kode di editor, Anda harus membuat versi baru:
 *    - Klik ikon pensil (Edit) di kanan atas pada penerapan aktif Anda.
 *    - Pada dropdown "Versi" (Version), pilih "Versi Baru" (New Version).
 *    - Pastikan setelan akses adalah "Siapa saja" (Anyone).
 *    - Klik "Terapkan" (Deploy).
 * 7. Salin URL Aplikasi Web yang diberikan, lalu paste ke variabel SPREADSHEET_URL di file index.html Anda (Baris 5610).
 */

function doGet(e) {
  try {
    // Mencari sheet bernama "RSVP". Jika tidak ada, gunakan sheet pertama (default)
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spreadsheet.getSheetByName("RSVP") || spreadsheet.getSheets()[0];
    
    // Ambil parameter kiriman
    var params = e.parameter;
    
    // Jika ada parameter 'author' (Nama), masukkan ucapan baru ke sheet terlebih dahulu
    if (params.author && params.author.trim() !== "") {
      var nama = params.author || "";
      var kehadiran = params.attendance || "";
      var guest = params.guest || "0";
      var ucapan = params.comment || "";
      var timestamp = params.timestamp || "";
      
      sheet.appendRow([timestamp, nama, kehadiran, guest, ucapan]);
    }
    
    // Ambil data ucapan yang ada untuk dikirimkan kembali ke website
    var data = sheet.getDataRange().getValues();
    var comments = [];
    
    for (var i = 1; i < data.length; i++) {
      if (!data[i][1]) continue; // Lewati jika nama kosong
      comments.push({
        timestamp: data[i][0] || "",
        nama: data[i][1] || "",
        kehadiran: data[i][2] || "",
        guest: String(data[i][3] || "0"),
        ucapan: data[i][4] || ""
      });
    }
    
    var output = JSON.stringify(comments);
    
    // Dukung format JSONP untuk memintas CORS secara total
    if (params.callback) {
      return ContentService.createTextOutput(params.callback + "(" + output + ")")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    
    // Fallback jika menggunakan Fetch / AJAX standar
    return ContentService.createTextOutput(output)
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    var errOutput = JSON.stringify({ status: "error", message: error.toString() });
    if (e.parameter && e.parameter.callback) {
      return ContentService.createTextOutput(e.parameter.callback + "(" + errOutput + ")")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(errOutput)
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Sediakan doPost agar tetap kompatibel
function doPost(e) {
  return doGet(e);
}
