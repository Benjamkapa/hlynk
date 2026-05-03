# M-Pesa Integration Guide for Providers

This guide outlines the exact steps to connect your HudumaLynk account directly to your Safaricom M-Pesa Till or Paybill number. This allows you to push payment requests (STK Push) directly to your customers' phones at the Point of Sale.

> [!IMPORTANT]
> To use this feature, your account must have access to the **M-Pesa Gateway** feature (typically available on Pro or higher subscription tiers).

## Prerequisites: Safaricom Daraja Credentials

Before you begin in HudumaLynk, you must have an approved app on the [Safaricom Daraja Portal](https://developer.safaricom.co.ke/). You will need the following four pieces of information from Safaricom:

1. **Consumer Key**: The public API key for your Daraja App.
2. **Consumer Secret**: The private API key for your Daraja App.
3. **Shortcode**: Your Business Paybill Number or Till Number.
4. **Passkey**: The unique password key provided by Safaricom for your specific shortcode.

## Step 1: Navigate to Developer Settings

1. Log into your HudumaLynk **Provider Portal**.
2. On the left-hand navigation menu, click on **Settings**.
3. In the Settings page, click on the **Developer** tab.

## Step 2: Configure Your Credentials

Inside the Developer tab, you will see the **Vendor M-Pesa Gateway** configuration panel.

1. **Select Environment**: 
   - Select **Sandbox** if you are testing with Safaricom's test credentials.
   - Select **Production** when you are ready to process real money.
2. Input your **Consumer Key** and **Consumer Secret**.
3. Input your **Shortcode** and **Passkey**.
4. Click the **Save Settings** button at the top right of the screen.

> [!TIP]
> The system securely encrypts your Consumer Secret and Passkey before storing them in the database to ensure your financial credentials remain safe.

## Step 3: Triggering Payments at the Point of Sale

Once configured, the M-Pesa option becomes fully automated in your Point of Sale (POS):

1. Go to the **Record Sale** page.
2. Add products or services to the cart as usual.
3. When checking out, select **M-Pesa** as the payment method.
4. Enter the customer's phone number.
5. Click **Trigger Payment**. 
6. The customer will immediately receive an STK Push prompt on their phone requesting their M-Pesa PIN.

## Step 4: Automatic Callbacks (How it works in the background)

You do not need to configure any callback URLs on the Safaricom portal manually. 

When you trigger a payment from the POS, HudumaLynk automatically tells Safaricom to send the success or failure response back to our secure webhook (`/api/v1/sales/mpesa-callback`). Once the customer enters their PIN, the system will automatically mark the sale as **Completed** or **Failed** in your dashboard.

> [!WARNING]
> If you change your Daraja App credentials on the Safaricom portal, you must immediately update them in the HudumaLynk Developer settings, otherwise your payment triggers will fail.
