# M-Pesa Automatic Customer Linkage

The system now seamlessly handles customer identities extracted directly from successful M-Pesa STK Push transactions.

## What Was Accomplished

1. **Automatic Customer Extraction & Creation**
   - When a Lipa Na M-Pesa transaction succeeds, the system unpacks the callback payload and extracts the paying phone number.
   - If that customer doesn't exist, it automatically creates a new Customer identity named `Customer XXXXXX` (using the last 6 digits of their phone to maintain privacy while being recognizable).
   - This identity is then hard-linked to the M-Pesa `Sale`, allowing their purchase history (`totalSpend`, `lastVisit`) to aggregate automatically without the provider needing to do manual data entry.

2. **Global Platform Identity System**
   - **The Bug We Fixed:** Previously, if a customer bought from Provider A, they belonged exclusively to Provider A. If they then bought from Provider B, the system would crash because the phone number was already taken.
   - **The Fix:** We upgraded the Customer database so that identities are unified across the platform. If a customer buys from Provider B, the system simply updates their existing global profile and links Provider B's sale to them. 
   - Providers will now see all customers who have purchased from them in their CRM, regardless of which Provider originally added them to the platform.

3. **Super Admin "Global Identity Registry"**
   - The Super Admin `User Operations` page now contains a dedicated **Global Identity Registry** table directly beneath the live sessions.
   - This allows you, as the super admin, to search and view every single registered user and auto-created M-Pesa customer across the entire system.

> [!TIP]
> Providers can navigate to their **Customers** tab and click `Edit` on any auto-created `Customer XXXXXX` profile to update it with their real First Name, Last Name, and Email address at any point. Because the identities are global, if one provider updates the customer's name, it updates across the platform!
