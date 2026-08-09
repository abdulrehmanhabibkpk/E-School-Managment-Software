/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Book, Search, Plus, Filter, ArrowRightLeft } from 'lucide-react';

const mockBooks = [
  { id: '1', title: 'Concepts of Physics', author: 'H.C. Verma', category: 'Science', status: 'Available', shelf: 'S1-A' },
  { id: '2', title: 'Modern Algebra', author: 'S.K. Jain', category: 'Mathematics', status: 'Issued', shelf: 'M2-B' },
  { id: '3', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Literature', status: 'Available', shelf: 'L4-C' },
  { id: '4', title: 'Global Geography', author: 'K. Siddhartha', category: 'Social Science', status: 'Available', shelf: 'SS1-A' },
  { id: '5', title: 'Advanced Biology', author: 'Campbell', category: 'Science', status: 'Issued', shelf: 'S1-B' },
];

export default function Library() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Library Inventory</h1>
          <p className="text-slate-500 mt-1">Manage books, issue/return records, and digital library access.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <Plus size={18} />
            Add New Book
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search by title or author..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-slate-400 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all">
                <Filter size={18} />
              </button>
            </div>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Book Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Shelf</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockBooks.map((book) => (
                <tr key={book.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Book size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{book.title}</p>
                        <p className="text-xs text-slate-500">{book.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600 font-medium">{book.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-400 font-mono">{book.shelf}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      book.status === 'Available' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {book.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="Issue/Return">
                      <ArrowRightLeft size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Library Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Books</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">12,450</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Issued</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">1,204</p>
              </div>
            </div>
          </div>
          
          <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
            <h3 className="font-bold text-lg mb-2">Digital Library</h3>
            <p className="text-indigo-100 text-sm leading-relaxed mb-6">
              Students can access 5,000+ digital journals and PDFs through the student portal.
            </p>
            <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors">
              Manage E-Library
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
