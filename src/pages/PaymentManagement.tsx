import React, { useState } from 'react';
import { useAuthStore } from '../lib/store';
import { CreditCard, Plus, Edit2, Trash2, Filter, Download } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import ExportButton from '../components/ExportButton';
import { mockStudents, mockAcademicYears } from '../lib/mockData';
import type { Payment, PaymentType } from '../types';

export default function PaymentManagement() {
  const { profile } = useAuthStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPaymentTypeModalOpen, setIsPaymentTypeModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editingPaymentType, setEditingPaymentType] = useState<PaymentType | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  const [paymentTypeToDelete, setPaymentTypeToDelete] = useState<PaymentType | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    student: '',
    type: '',
    status: '',
    academic_year: '',
    date_from: '',
    date_to: '',
  });

  const [paymentFormData, setPaymentFormData] = useState<Omit<Payment, 'id' | 'created_at' | 'updated_at' | 'created_by'>>({
    student_id: '',
    academic_year_id: '',
    amount: 0,
    type: 'Inscription',
    status: 'pending',
    payment_method: 'cash',
    reference: '',
    description: '',
    due_date: '',
    payment_date: undefined
  });

  const [paymentTypeFormData, setPaymentTypeFormData] = useState<Omit<PaymentType, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    amount: 0,
    academic_year_id: '',
    level: 'L1',
    faculty_id: '',
    due_date: '',
    status: 'active',
    description: ''
  });

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    
    if (editingPayment) {
      setPayments(payments.map(payment => 
        payment.id === editingPayment.id 
          ? { ...payment, ...paymentFormData, updated_at: now }
          : payment
      ));
    } else {
      setPayments([...payments, {
        ...paymentFormData,
        id: String(payments.length + 1),
        created_at: now,
        updated_at: now,
        created_by: profile?.id || ''
      }]);
    }
    setIsPaymentModalOpen(false);
    setEditingPayment(null);
    resetPaymentForm();
  };

  const handlePaymentTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    
    if (editingPaymentType) {
      setPaymentTypes(paymentTypes.map(type => 
        type.id === editingPaymentType.id 
          ? { ...type, ...paymentTypeFormData, updated_at: now }
          : type
      ));
    } else {
      setPaymentTypes([...paymentTypes, {
        ...paymentTypeFormData,
        id: String(paymentTypes.length + 1),
        created_at: now,
        updated_at: now
      }]);
    }
    setIsPaymentTypeModalOpen(false);
    setEditingPaymentType(null);
    resetPaymentTypeForm();
  };

  const handlePaymentDelete = (payment: Payment) => {
    setPaymentToDelete(payment);
  };

  const handlePaymentTypeDelete = (paymentType: PaymentType) => {
    setPaymentTypeToDelete(paymentType);
  };

  const confirmPaymentDelete = () => {
    if (paymentToDelete) {
      setPayments(payments.filter(payment => payment.id !== paymentToDelete.id));
      setPaymentToDelete(null);
    }
  };

  const confirmPaymentTypeDelete = () => {
    if (paymentTypeToDelete) {
      setPaymentTypes(paymentTypes.filter(type => type.id !== paymentTypeToDelete.id));
      setPaymentTypeToDelete(null);
    }
  };

  const resetPaymentForm = () => {
    setPaymentFormData({
      student_id: '',
      academic_year_id: '',
      amount: 0,
      type: 'Inscription',
      status: 'pending',
      payment_method: 'cash',
      reference: '',
      description: '',
      due_date: '',
      payment_date: undefined
    });
  };

  const resetPaymentTypeForm = () => {
    setPaymentTypeFormData({
      name: '',
      amount: 0,
      academic_year_id: '',
      level: 'L1',
      faculty_id: '',
      due_date: '',
      status: 'active',
      description: ''
    });
  };

  const handleExport = async () => {
    // Implement export logic
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  if (!profile || profile.role !== 'admin') {
    return <div>Accès refusé</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <CreditCard size={32} className="text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold">Gestion des Paiements</h2>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => {
              setEditingPaymentType(null);
              resetPaymentTypeForm();
              setIsPaymentTypeModalOpen(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <Plus size={20} />
            <span>Nouveau type de paiement</span>
          </button>
          <button
            onClick={() => {
              setEditingPayment(null);
              resetPaymentForm();
              setIsPaymentModalOpen(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus size={20} />
            <span>Nouveau paiement</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter size={20} className="text-gray-400" />
          <h3 className="text-lg font-semibold">Filtres</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Étudiant</label>
            <select
              value={filters.student}
              onChange={(e) => setFilters({ ...filters, student: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Tous les étudiants</option>
              {mockStudents.map(student => (
                <option key={student.id} value={student.id}>
                  {student.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type de paiement</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Tous les types</option>
              <option value="Inscription">Inscription</option>
              <option value="Scolarité">Scolarité</option>
              <option value="Examen">Examen</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Statut</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="completed">Complété</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Année académique</label>
            <select
              value={filters.academic_year}
              onChange={(e) => setFilters({ ...filters, academic_year: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Toutes les années</option>
              {mockAcademicYears.map(year => (
                <option key={year.id} value={year.id}>
                  {year.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date de début</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date de fin</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Payment List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Liste des paiements</h3>
            <ExportButton onExport={handleExport} label="Exporter les paiements" />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Étudiant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date d'échéance
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {payments.map((payment) => {
                  const student = mockStudents.find(s => s.id === payment.student_id);
                  return (
                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                                {student?.full_name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium">{student?.full_name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              #{student?.student_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm">{payment.type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium">
                          {payment.amount.toLocaleString()} FCFA
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          payment.status === 'completed'
                            ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                            : payment.status === 'pending'
                            ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200'
                            : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'
                        }`}>
                          {payment.status === 'completed' ? 'Complété'
                            : payment.status === 'pending' ? 'En attente'
                            : 'Annulé'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm">
                          {new Date(payment.due_date).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setEditingPayment(payment);
                            setPaymentFormData({
                              student_id: payment.student_id,
                              academic_year_id: payment.academic_year_id,
                              amount: payment.amount,
                              type: payment.type,
                              status: payment.status,
                              payment_method: payment.payment_method,
                              reference: payment.reference || '',
                              description: payment.description || '',
                              due_date: payment.due_date,
                              payment_date: payment.payment_date
                            });
                            setIsPaymentModalOpen(true);
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-4"
                        >
                          <Edit2 size={20} />
                        </button>
                        <button
                          onClick={() => handlePaymentDelete(payment)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        >
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setEditingPayment(null);
          resetPaymentForm();
        }}
        title={editingPayment ? 'Modifier le paiement' : 'Nouveau paiement'}
      >
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <div>
            <label htmlFor="student_id" className="block text-sm font-medium mb-1">
              Étudiant
            </label>
            <select
              id="student_id"
              value={paymentFormData.student_id}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, student_id: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              required
            >
              <option value="">Sélectionner un étudiant</option>
              {mockStudents.map(student => (
                <option key={student.id} value={student.id}>
                  {student.full_name} - #{student.student_id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="academic_year_id" className="block text-sm font-medium mb-1">
              Année académique
            </label>
            <select
              id="academic_year_id"
              value={paymentFormData.academic_year_id}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, academic_year_id: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              required
            >
              <option value="">Sélectionner une année académique</option>
              {mockAcademicYears.map(year => (
                <option key={year.id} value={year.id}>
                  {year.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium mb-1">
                Type de paiement
              </label>
              <select
                id="type"
                value={paymentFormData.type}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, type: e.target.value as Payment['type'] })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                required
              >
                <option value="Inscription">Inscription</option>
                <option value="Scolarité">Scolarité</option>
                <option value="Examen">Examen</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium mb-1">
                Montant
              </label>
              <input
                type="number"
                id="amount"
                value={paymentFormData.amount}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                required
                min="0"
              />
            </div>

            <div>
              <label htmlFor="payment_method" className="block text-sm font-medium mb-1">
                Méthode de paiement
              </label>
              <select
                id="payment_method"
                value={paymentFormData.payment_method}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, payment_method: e.target.value as Payment['payment_method'] })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                required
              >
                <option value="cash">Espèces</option>
                <option value="bank_transfer">Virement bancaire</option>
                <option value="mobile_money">Mobile Money</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-1">
                Statut
              </label>
              <select
                id="status"
                value={paymentFormData.status}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, status: e.target.value as Payment['status'] })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                required
              >
                <option value="pending">En attente</option>
                <option value="completed">Complété</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="reference" className="block text-sm font-medium mb-1">
              Référence
            </label>
            <input
              type="text"
              id="reference"
              value={paymentFormData.reference}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, reference: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              placeholder="Numéro de référence du paiement"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={paymentFormData.description}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="due_date" className="block text-sm font-medium mb-1">
                Date d'échéance
              </label>
              <input
                type="date"
                id="due_date"
                value={paymentFormData.due_date}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, due_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>

            <div>
              <label htmlFor="payment_date" className="block text-sm font-medium mb-1">
                Date de paiement
              </label>
              <input
                type="date"
                id="payment_date"
                value={paymentFormData.payment_date || ''}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, payment_date: e.target.value || undefined })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {editingPayment ? 'Modifier' : 'Enregistrer'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPaymentModalOpen(false);
                setEditingPayment(null);
                resetPaymentForm();
              }}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Annuler
            </button>
          </div>
        </form>
      </Modal>

      {/* Payment Type Modal */}
      <Modal
        isOpen={isPaymentTypeModalOpen}
        onClose={() => {
          setIsPaymentTypeModalOpen(false);
          setEditingPaymentType(null);
          resetPaymentTypeForm();
        }}
        title={editingPaymentType ? 'Modifier le type de paiement' : 'Nouveau type de paiement'}
      >
        <form onSubmit={handlePaymentTypeSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Nom
            </label>
            <input
              type="text"
              id="name"
              value={paymentTypeFormData.name}
              onChange={(e) => setPaymentTypeFormData({ ...paymentTypeFormData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium mb-1">
                Montant
              </label>
              <input
                type="number"
                id="amount"
                value={paymentTypeFormData.amount}
                onChange={(e) => setPaymentTypeFormData({ ...paymentTypeFormData, amount: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                required
                min="0"
              />
            </div>

            <div>
              <label htmlFor="level" className="block text-sm font-medium mb-1">
                Niveau
              </label>
              <select
                id="level"
                value={paymentTypeFormData.level}
                onChange={(e) => setPaymentTypeFormData({ ...paymentTypeFormData, level: e.target.value as PaymentType['level'] })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                required
              >
                <option value="L1">L1</option>
                <option value="L2">L2</option>
                <option value="L3">L3</option>
                <option value="M1">M1</option>
                <option value="M2">M2</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={paymentTypeFormData.description}
              onChange={(e) => setPaymentTypeFormData({ ...paymentTypeFormData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="due_date" className="block text-sm font-medium mb-1">
                Date d'échéance
              </label>
              <input
                type="date"
                id="due_date"
                value={paymentTypeFormData.due_date}
                onChange={(e) => setPaymentTypeFormData({ ...paymentTypeFormData, due_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div> ```jsx
            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-1">
                Statut
              </label>
              <select
                id="status"
                value={paymentTypeFormData.status}
                onChange={(e) => setPaymentTypeFormData({ ...paymentTypeFormData, status: e.target.value as 'active' | 'inactive' })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                required
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {editingPaymentType ? 'Modifier' : 'Enregistrer'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPaymentTypeModalOpen(false);
                setEditingPaymentType(null);
                resetPaymentTypeForm();
              }}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Annuler
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Payment Confirmation Modal */}
      <ConfirmationModal
        isOpen={paymentToDelete !== null}
        onClose={() => setPaymentToDelete(null)}
        onConfirm={confirmPaymentDelete}
        title="Supprimer le paiement"
        message={`Êtes-vous sûr de vouloir supprimer ce paiement ? Cette action est irréversible.`}
      />

      {/* Delete Payment Type Confirmation Modal */}
      <ConfirmationModal
        isOpen={paymentTypeToDelete !== null}
        onClose={() => setPaymentTypeToDelete(null)}
        onConfirm={confirmPaymentTypeDelete}
        title="Supprimer le type de paiement"
        message={`Êtes-vous sûr de vouloir supprimer ce type de paiement ? Cette action est irréversible.`}
      />
    </div>
  );
}