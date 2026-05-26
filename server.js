const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Initialize your Supabase database client
const supabase = createClient(
    process.env.SUPABASE_URL || 'https://fezdfarrseinuumqzqqs.supabase.co',
    process.env.SUPABASE_ANON_KEY || 'sb_publishable_JbgZpfcy3uJeGQko4zO62w_KN0n3ooC'
);

// Target Sales Agent Phone Number for WhatsApp Redirect (Put your number here)
const SALES_AGENT_WHATSAPP = "254780547049"; 

// ROUTE 1: Serves your motorbike application form page
app.get('/apply', (req, res) => {
    res.render('apply');
});

// ROUTE 2: Handles form submission, saves data to Supabase, and builds the WhatsApp link
app.post('/api/submit-application', async (req, res) => {
    const { fullName, nationalId, phone, kraPin, bikeModel, bodaStage, county, paymentPlan } = req.body;

    try {
        // 1. Insert the applicant's details directly into your Supabase database table
        const { error } = await supabase
            .from('motorbike_applications')
            .insert([{
                full_name: fullName,
                national_id: nationalId,
                phone_number: phone,
                kra_pin: kraPin,
                bike_model: bikeModel,
                boda_stage_name: bodaStage,
                county: county,
                payment_plan: paymentPlan
            }]);

        if (error) throw error;

        // 2. Format a professional text message for the sales agent's WhatsApp layout
        const whatsappMessage = `*NEW BODA FINANCING APPLICATION*\n\n` +
                                `• *Name:* ${fullName}\n` +
                                `• *ID Number:* ${nationalId}\n` +
                                `• *Phone:* ${phone}\n` +
                                `• *KRA PIN:* ${kraPin}\n` +
                                `• *Bike Model:* ${bikeModel}\n` +
                                `• *Boda Stage:* ${bodaStage}\n` +
                                `• *County:* ${county}\n` +
                                `• *Payment Plan:* ${paymentPlan}\n\n` +
                                `Please review my application profile details.`;

        const encodedText = encodeURIComponent(whatsappMessage);
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${SALES_AGENT_WHATSAPP}&text=${encodedText}`;

        return res.status(200).json({ success: true, whatsappUrl: whatsappUrl });

    } catch (err) {
        console.error("Database Error:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/', (req, res) => {
    res.redirect('/apply');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Motorbike onboarding server active on port ${PORT}`);
});
