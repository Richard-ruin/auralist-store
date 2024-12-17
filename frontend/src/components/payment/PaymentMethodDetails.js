import React from 'react';
import CopyButton from './CopyButton'; // Fixed import
import { formatters } from '../../utils/formatters'; // Fixed import

// Bank account information
const bankAccounts = {
  visa: {
    name: "Auralist Store",
    number: "4532 0159 8744 6321",
    type: "Visa"
  },
  mastercard: {
    name: "Auralist Store",
    number: "5412 7534 9821 0063",
    type: "Mastercard"
  },
  bri: {
    name: "Auralist Store",
    number: "0123 0124 5678 901",
    type: "BRI"
  },
  bca: {
    name: "Auralist Store",
    number: "8736 4521 9087",
    type: "BCA"
  },
  mandiri: {
    name: "Auralist Store",
    number: "1270 0012 3456 789",
    type: "Mandiri"
  }
};

const PaymentMethodDetails = ({ paymentMethod, amount, currency = 'USD' }) => {
  const bankAccount = bankAccounts[paymentMethod];

  if (!bankAccount) {
    return (
      <div className="text-center text-red-600">
        Invalid payment method selected
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-white rounded-lg border border-gray-200 p-4">
      {/* Bank Details */}
      <div>
        <h4 className="text-sm font-medium text-gray-700">Transfer to {bankAccount.type}</h4>
        <div className="mt-2">
          <div className="text-sm text-gray-600">Account Name</div>
          <div className="font-medium">{bankAccount.name}</div>
        </div>
        <div className="mt-2">
          <div className="text-sm text-gray-600">Account Number</div>
          <div className="flex items-center space-x-2">
            <div className="font-mono font-medium">{bankAccount.number}</div>
            <CopyButton text={bankAccount.number} />
          </div>
        </div>
      </div>

      {/* Amount */}
      <div className="pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">Transfer Amount</div>
        <div className="flex items-center space-x-2 mt-1">
          <div className="text-lg font-medium">
            {formatters.currency(amount, currency)}
          </div>
          <CopyButton 
            text={amount.toString()} 
          />
        </div>
        <p className="text-sm text-red-500 mt-1">
          Please transfer the exact amount for faster verification
        </p>
      </div>

      {/* Notes */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Important Notes:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Keep your payment proof for verification</li>
          <li>• Transfer must be completed within time limit</li>
          <li>• Double check account number before transferring</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentMethodDetails;