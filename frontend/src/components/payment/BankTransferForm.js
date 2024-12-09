// components/payment/BankTransferForm.js
import React, { useState } from 'react';
import { Copy, Check, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';

const BankTransferForm = ({ onFileChange, bankAccounts }) => {
  const [copiedAccount, setCopiedAccount] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleCopy = async (accountNumber) => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopiedAccount(accountNumber);
      toast.success('Account number copied!');
      setTimeout(() => setCopiedAccount(null), 2000);
    } catch (err) {
      toast.error('Failed to copy account number');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size should be less than 10MB');
        return;
      }
      setSelectedFile(file);
      onFileChange(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Bank Account Details */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Bank Account Details</h3>
        <div className="space-y-4">
          {bankAccounts.map((account) => (
            <div 
              key={account.accountNumber}
              className="flex items-center justify-between p-4 bg-white rounded-md border border-gray-200"
            >
              <div>
                <p className="font-medium text-gray-900">{account.bank}</p>
                <p className="text-gray-600">{account.accountNumber}</p>
                <p className="text-sm text-gray-500">{account.accountName}</p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(account.accountNumber)}
                className={`
                  inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium
                  ${copiedAccount === account.accountNumber
                    ? 'border-green-500 text-green-500'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                {copiedAccount === account.accountNumber ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Payment Proof */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Payment Proof
        </label>
        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer block text-center"
          >
            <div className="space-y-2">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="text-gray-600">
                {selectedFile ? (
                  <>
                    <span className="text-primary-600">{selectedFile.name}</span>
                    <br />
                    <span className="text-sm">Click to change file</span>
                  </>
                ) : (
                  <>
                    <span className="text-primary-600 font-medium">Click to upload</span>
                    <span className="text-gray-500"> or drag and drop</span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG up to 10MB
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-yellow-800 mb-2">Instructions</h4>
        <ol className="list-decimal ml-4 text-sm text-yellow-700 space-y-1">
          <li>Copy the bank account number</li>
          <li>Make the transfer using your banking app or internet banking</li>
          <li>Take a screenshot or photo of the transfer confirmation</li>
          <li>Upload the proof of payment above</li>
          <li>Click "Complete Payment" to submit your payment proof</li>
        </ol>
      </div>
    </div>
  );
};

export default BankTransferForm;