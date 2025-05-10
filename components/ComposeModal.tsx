'use client';
import { useRef, useState } from 'react';
import { Send, Plus, X, Upload, File, ImageDown } from 'lucide-react';
import { Email } from '@/app/types';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (newEmail: Email) => void;
}

interface Attachment {
  name: string;
  type: string;
  content: string;
  cid?: string; 
}

export default function ComposeModal({ isOpen, onClose, onSend }: ComposeModalProps) {
  const [formData, setFormData] = useState({
    from: 'donations@rtnewworld.com',
    to: [''],
    bcc: [''],
    subject: '',
    body: '',
    ctas: [{ text: '', link: '' }],
    senderInfo: {
      name: '',
      position: '',
      email: '',
      phone: ''
    },
     attachments: [] as Attachment[]
  });
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const BccfileInputRef = useRef<HTMLInputElement>(null);


const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  const newAttachments = [...formData.attachments];
  
  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const content = event.target.result.toString().split(',')[1];
        const attachment: Attachment = { // Explicitly type the attachment
          name: file.name,
          type: file.type,
          content: content
        };
        
        // Add CID only for images
        if (file.type.startsWith('image/')) {
          attachment.cid = `image_${Math.random().toString(36).substr(2, 9)}`;
        }
        
        newAttachments.push(attachment);
        
        setFormData(prev => ({
          ...prev,
          attachments: newAttachments
        }));
      }
    };
    reader.readAsDataURL(file);
  });
};

  const removeAttachment = (index: number) => {
    const newAttachments = formData.attachments.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      attachments: newAttachments
    }));
  };

  const handleChange = (e:any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSenderInfoChange = (e:any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      senderInfo: { ...prev.senderInfo, [name]: value }
    }));
  };

  const handleBccChange = (index: number, value: string) => {
    const newBcc = [...formData.bcc];
    newBcc[index] = value;
    setFormData(prev => ({ ...prev, bcc: newBcc }));
  };
  
  const addBccRecipient = () => {
    setFormData(prev => ({ ...prev, bcc: [...prev.bcc, ''] }));
  };
  
  const removeBccRecipient = (index: number) => {
    const newBcc = formData.bcc.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, bcc: newBcc }));
  };

  const handleRecipientChange = (index: number, value: string) => {
    const newTo = [...formData.to];
    newTo[index] = value;
    setFormData(prev => ({ ...prev, to: newTo }));
  };

  const addRecipient = () => {
    setFormData(prev => ({ ...prev, to: [...prev.to, ''] }));
  };

  const removeRecipient = (index: number) => {
    const newTo = formData.to.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, to: newTo }));
  };

  const handleCtaChange = (index: number, field: string, value: string) => {
    const newCtas = [...formData.ctas];
    newCtas[index][field as 'text' | 'link'] = value;
    setFormData(prev => ({ ...prev, ctas: newCtas }));
  };

  const addCta = () => {
    setFormData(prev => ({ ...prev, ctas: [...prev.ctas, { text: '', link: '' }] }));
  };

  const removeCta = (index: number) => {
    const newCtas = formData.ctas.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, ctas: newCtas }));
  };

    // New handler for file import
    const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>, field: 'to' | 'bcc') => {
      const file = e.target.files?.[0];
      if (!file) return;
  
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          // Split by new lines and filter out empty lines
          const emails = content
            .split('\n')
            .map(email => email.trim())
            .filter(email => email !== '' && email.includes('@')); // Basic email validation
          
          if (emails.length === 0) {
            toast.error('No valid emails found in the file');
            return;
          }
  
          // Update the appropriate field (to or bcc)
          setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], ...emails]
          }));
  
          toast.success(`Imported ${emails.length} emails to ${field.toUpperCase()}`);
        } catch (err) {
          toast.error('Failed to parse file');
        } finally {
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };
      reader.readAsText(file);
    };
  

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
  
    // Validate required fields
    if (!formData.from || !formData.subject || !formData.body || 
      formData.to.some(t => !t) || formData.ctas.some(c => !c.text || !c.link)) {
    setError('Please fill all required fields');
    toast.error('Please fill all required fields');
    return;
  }

  try {
    setIsSending(true);
    
    const toastId = toast.loading('Sending email...');
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        ...formData,
        to: formData.to.filter(t => t.trim() !== ''), // Remove empty recipients
        bcc: formData.bcc.filter(b => b.trim() !== '') // Remove empty BCCs
      })
    });

 
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }
  
      // Update loading toast to success
      toast.success('Email sent successfully!', { id: toastId });
      
      onClose();
      onSend(data); // Pass the response data to the parent component
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send email';
      setError(errorMessage);
      
      // Show error toast
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#0d404f] flex items-center">
            <Send className="mr-2" />
            Compose New Email
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* From Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From *
            </label>
            <input
              name="from"
              type="email"
              required
              value={formData.from}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#ff795f] focus:border-[#ff795f]"
            />
          </div>

          {/* To Field - Multiple Recipients */}
          <div>
    <div className="flex justify-between items-center mb-1">
      <label className="block text-sm font-medium text-gray-700">
        To *
      </label>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="text-sm text-[#0d404f] hover:text-[#ff795f] flex items-center"
      >
        <Upload className="w-4 h-4 mr-1" />
        Import List
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileImport(e, 'to')}
        accept=".txt,.csv"
        className="hidden"
      />
    </div>
            {formData.to.map((recipient, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="email"
                  value={recipient}
                  onChange={(e) => handleRecipientChange(index, e.target.value)}
                  required
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#ff795f] focus:border-[#ff795f]"
                  placeholder="recipient@example.com"
                />
                {formData.to.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRecipient(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addRecipient}
              className="mt-2 text-sm text-[#0d404f] hover:text-[#ff795f] flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Recipient
            </button>
          </div>

          {/* BCC Field - Multiple Recipients */}
          <div>
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">  
        <label className="block text-sm font-medium text-gray-700 mb-1">
          BCC (Blind Carbon Copy)
        </label>
        <div className="group relative">
          <span className="text-gray-400 hover:text-gray-600 cursor-help">ⓘ</span>
          <div className="absolute z-10 hidden group-hover:block w-64 p-2 text-xs bg-gray-800 text-white rounded shadow-lg">
            BCC recipients will receive the email but won't be visible to other recipients
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => BccfileInputRef.current?.click()}
        className="text-sm text-[#0d404f] hover:text-[#ff795f] flex items-center"
      >
        <Upload className="w-4 h-4 mr-1" />
        Import List
      </button>
      <input
        type="file"
        ref={BccfileInputRef}
        onChange={(e) => handleFileImport(e, 'bcc')}
        accept=".txt,.csv"
        className="hidden"
      />
    </div>
            {formData.bcc.map((recipient, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="email"
                  value={recipient}
                  onChange={(e) => handleBccChange(index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#ff795f] focus:border-[#ff795f]"
                  placeholder="hidden_recipient@example.com"
                />
                {formData.bcc.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBccRecipient(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addBccRecipient}
              className="mt-2 text-sm text-[#0d404f] hover:text-[#ff795f] flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add BCC Recipient
            </button>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject *
            </label>
            <input
              name="subject"
              type="text"
              required
              value={formData.subject}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#ff795f] focus:border-[#ff795f]"
              placeholder="Urgent: Help Children Affected by Sudan Crisis"
            />
          </div>

          {/* Email Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message *
            </label>
            <textarea
              name="body"
              required
              value={formData.body}
              onChange={handleChange}
              rows={8}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#ff795f] focus:border-[#ff795f]"
              placeholder="Dear Compassionate Supporter,..."
            />
          </div>

          <div className="border-t pt-6">
  <h3 className="text-lg font-medium text-[#0d404f] mb-4">Attachments</h3>
  
  {/* File upload input */}
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Add Attachments
    </label>
    <div className="flex items-center">
      <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff795f]">
        <input
          type="file"
          multiple
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
        />
        Select Files
      </label>
      <span className="ml-3 text-sm text-gray-500">
        Supports images, PDFs, and documents
      </span>
    </div>
  </div>

  {/* Attachments preview */}
  {formData.attachments.length > 0 && (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700">Selected Files:</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {formData.attachments.map((attachment, index) => (
          <div key={index} className="flex items-center p-2 border rounded-md bg-gray-50">
            <div className="flex-shrink-0 mr-3">
              {attachment.type.startsWith('image/') ? (
                <ImageDown className="h-8 w-8 text-[#0d404f]" />
              ) : (
                <File className="h-8 w-8 text-[#0d404f]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {attachment.name}
              </p>
              <p className="text-xs text-gray-500">
                {attachment.type.split('/')[1]?.toUpperCase() || 'FILE'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => removeAttachment(index)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )}
</div>

          {/* Call-to-Action Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Call-to-Action Buttons *
            </label>
            {formData.ctas.map((cta, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={cta.text}
                    onChange={(e) => handleCtaChange(index, 'text', e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#ff795f] focus:border-[#ff795f]"
                    placeholder="Donate Now"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Button Link</label>
                  <input
                    type="url"
                    value={cta.link}
                    onChange={(e) => handleCtaChange(index, 'link', e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#ff795f] focus:border-[#ff795f]"
                    placeholder="https://www.rtnewworld.com/donate"
                  />
                </div>
                {formData.ctas.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCta(index)}
                    className="md:col-span-2 text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove Button
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addCta}
              className="mt-2 text-sm text-[#0d404f] hover:text-[#ff795f] flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Another Button
            </button>
          </div>

          {/* Sender Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-[#0d404f] mb-4">Sender Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  name="name"
                  type="text"
                  value={formData.senderInfo.name}
                  onChange={handleSenderInfoChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#ff795f] focus:border-[#ff795f]"
                  placeholder="Joe Pascal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <input
                  name="position"
                  type="text"
                  value={formData.senderInfo.position}
                  onChange={handleSenderInfoChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#ff795f] focus:border-[#ff795f]"
                  placeholder="Program Director"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  value={formData.senderInfo.email}
                  onChange={handleSenderInfoChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#ff795f] focus:border-[#ff795f]"
                  placeholder="jep@rtnewworld.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.senderInfo.phone}
                  onChange={handleSenderInfoChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#ff795f] focus:border-[#ff795f]"
                  placeholder="+211 123 456 789"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="sticky bottom-0 bg-white pt-6 border-t flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#ff795f] hover:bg-[#0d404f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff795f] ${
                isSending ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSending ? 'Sending...' : 'Send Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}