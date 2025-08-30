# Razorpay Integration Setup Guide

## Overview
This document provides instructions for setting up Razorpay payment gateway integration in the ShopWeve e-commerce application.

## Prerequisites
- A Razorpay account (you can create one at [razorpay.com](https://razorpay.com))
- API keys from your Razorpay dashboard

## Setup Steps

### 1. Get Your API Keys
1. Log in to your Razorpay Dashboard
2. Navigate to Settings > API Keys
3. Generate a new API key pair if you don't have one already
4. Note down your Key ID and Key Secret

### 2. Configure Backend Environment Variables
Update the `.env` file in the backend directory with your Razorpay credentials:

```
RAZORPAY_KEY_ID="your_key_id_here"
RAZORPAY_KEY_SECRET="your_key_secret_here"
```

### 3. Configure Frontend Environment Variables
Update the `.env.local` file in the root directory with your Razorpay public key:

```
NEXT_PUBLIC_RAZORPAY_KEY_ID="your_key_id_here"
```

### 4. Security Best Practices
- Never commit your API keys to version control
- Always keep your Key Secret on the server side only
- Use the verification endpoint to validate payments
- Set up webhook notifications for payment events

### 5. Testing
Razorpay provides test credentials and a sandbox environment for testing:
- Use test mode in your Razorpay dashboard
- For test payments, use the test card numbers provided in the [Razorpay documentation](https://razorpay.com/docs/payments/payments/test-card-details/)

## Implementation Details

### Payment Flow
1. User initiates checkout
2. Backend creates a Razorpay order
3. Frontend displays Razorpay payment form
4. User completes payment
5. Backend verifies payment signature
6. Order is confirmed

### API Endpoints
- `POST /api/razorpay`: Creates a new payment order
- `POST /api/razorpay/verify`: Verifies payment signature

## Troubleshooting
If you encounter issues with payments:
1. Check that your API keys are correctly configured
2. Ensure the order amount matches between backend and frontend
3. Verify that the signature verification is working correctly
4. Check Razorpay dashboard for payment status and errors

## Additional Resources
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay API Reference](https://razorpay.com/docs/api/)