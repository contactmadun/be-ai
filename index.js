import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch'; // Untuk mengambil JSON dari GitHub
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
app.use(express.json());
app.use(cors()); // Agar bisa diakses dari frontend Vue

// Konfigurasi
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Ambil dari environment variable
// const JSON_DATABASE_URL = 'https://raw.githubusercontent.com/contactmadun/database-ai/refs/heads/main/database.json'; // Ganti dengan URL Anda
const JSON_DATABASE_URL = 'https://raw.githubusercontent.com/contactmadun/database-ai/main/database.json';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Endpoint utama
// app.post('/ask', async (req, res) => {
//     try {
//         const { errorCode } = req.body;
//         if (!errorCode) {
//             return res.status(400).json({ error: 'Kode error dibutuhkan' });
//         }

//         // 1. Ambil database dari GitHub
//         const response = await fetch(JSON_DATABASE_URL);
//         const database = await response.json();

//         // 2. Cari data error di database
//         const errorData = database.find(err => err.kode_error.toLowerCase() === errorCode.toLowerCase());

//         if (!errorData) {
//             return res.status(404).json({ error: 'Kode error tidak ditemukan' });
//         }

//         // 3. Siapkan prompt dan panggil Gemini
//         const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
//         const prompt = `Anda adalah asisten virtual untuk teknisi lapangan. Tugas Anda adalah memberikan solusi untuk kode error berdasarkan data yang ada. Jawab dengan gaya bahasa yang santai, ringkas, dan langsung ke intinya, seperti seorang teman yang membantu. Selalu awali jawaban dengan sapaan.. Data: ${JSON.stringify(errorData)}`;

//         const result = await model.generateContent(prompt);
//         const aiResponse = await result.response;
//         const text = aiResponse.text();

//         // 4. Kirim jawaban AI ke frontend
//         res.json({ answer: text });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Terjadi kesalahan pada server' });
//     }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server berjalan di port ${PORT}`);
// });

app.post('/ask', async (req, res) => {
    try {
        const { errorCode } = req.body;
        if (!errorCode) {
            return res.status(400).json({ error: 'Kode error dibutuhkan' });
        }

        // 1. Ambil database dari GitHub
        const response = await fetch(JSON_DATABASE_URL);
        const database = await response.json();

        // 2. Cari data error di database (lebih fleksibel, tidak harus exact match)
        const errorData = database.find(err =>
            errorCode.toLowerCase().includes(err.kode_error.toLowerCase())
        );

        if (!errorData) {
            return res.status(404).json({ error: 'Kode error tidak ditemukan' });
        }

        // 3. Prompt ke Gemini (atur gaya jawaban lebih natural)
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `
Kamu adalah asisten virtual untuk teknisi lapangan. 
Tugasmu menjelaskan solusi error dengan gaya santai, ringkas, dan seperti teman ngobrol. 
Jangan bikin jawaban dalam bentuk laporan resmi, daftar poin yang terlalu panjang, atau format kaku. 
Selalu awali jawaban dengan sapaan hangat (contoh: "Halo bro!", "Hai, aku bantuin ya"). 
Kalau bisa, kasih tips praktis dan langsung ke inti.

Data error yang kamu jadikan referensi: ${JSON.stringify(errorData)}
`;

        const result = await model.generateContent(prompt);
        const aiResponse = await result.response;
        const text = aiResponse.text();

        // 4. Kirim jawaban AI ke frontend
        res.json({ answer: text });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});

