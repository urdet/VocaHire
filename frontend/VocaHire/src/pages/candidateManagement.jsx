import React, { useState, useMemo } from 'react';
import { Search, User, Mail, Phone, Hash, Clock, MapPin, Info, CreditCard } from 'lucide-react';

export default function CandidateManagement({ t = {}, lang = 'en' }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data following the candidate table schema from the class diagram exactly
  const [candidates] = useState([
    {
      id: 'can_8f72a1',
      first_name: 'Sarah',
      last_name: 'Montgomery',
      cin: 'AB123456',
      email: 's.montgomery@example.com',
      phone: '+1 555-123-4567',
      city: 'Casablanca',
      infos: 'Senior Frontend specialist',
      created_at: '2026-03-05',
    },
    {
      id: 'can_3b90c4',
      first_name: 'Alex',
      last_name: 'Rivera',
      cin: 'CD987654',
      email: 'a.rivera@techcorp.io',
      phone: '+1 555-987-6543',
      city: 'Rabat',
      infos: 'Fullstack developer',
      created_at: '2026-03-06',
    },
    {
      id: 'can_5e21d8',
      first_name: 'Jordan',
      last_name: 'Smith',
      cin: 'EF000111',
      email: 'jordan.s@freemail.com',
      phone: '+1 555-000-1111',
      city: 'Tangier',
      infos: 'DevOps intern',
      created_at: '2026-03-07',
    },
    {
      id: 'can_2d11x9',
      first_name: 'Leila',
      last_name: 'Bennani',
      cin: 'GH555222',
      email: 'l.bennani@services.ma',
      phone: '+212 600-000000',
      city: 'Marrakesh',
      infos: 'Marketing lead candidate',
      created_at: '2026-03-08',
    }
  ]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => 
      `${candidate.first_name} ${candidate.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.cin.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, candidates]);

  const isRtl = lang === 'ar';

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'}
      className="animate-in fade-in slide-in-from-right-4 duration-500 bg-[var(--bg-primary)] min-h-screen p-4 md:p-8"
    >
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-2">
          {t.candidateManagement || 'Candidate Management'}
        </h1>
        <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] font-mono">
          <span className="flex items-center gap-1">
            <User size={14} /> {candidates.length} {t.totalCandidates || 'Total Candidates'}
          </span>
        </div>
      </header>

      <section className="space-y-6">
        {/* Search Bar */}
        <div className="flex gap-2 w-full max-w-lg relative">
          <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
            <Search size={16} className="text-[var(--text-muted)]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t.searchCandidates || 'Search by name, email, or CIN...'}
            className={`w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-all`}
          />
        </div>

        {/* Candidates Table */}
        <div className="w-full overflow-hidden bg-[var(--card-bg)] border border-[var(--border-light)] rounded-xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-light)] text-[var(--text-muted)] text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-4"><div className="flex items-center gap-1.5"><Hash size={12} /> ID</div></th>
                  <th className="px-6 py-4">Full Name</th>
                  <th className="px-6 py-4"><div className="flex items-center gap-1.5"><CreditCard size={12} /> CIN</div></th>
                  <th className="px-6 py-4"><div className="flex items-center gap-1.5"><Mail size={12} /> Contact</div></th>
                  <th className="px-6 py-4"><div className="flex items-center gap-1.5"><MapPin size={12} /> City</div></th>
                  <th className="px-6 py-4"><div className="flex items-center gap-1.5"><Info size={12} /> Infos</div></th>
                  <th className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-1.5"><Clock size={12} /> Date</div></th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-[var(--border-light)]">
                {filteredCandidates.length > 0 ? (
                  filteredCandidates.map((candidate) => (
                    <tr 
                      key={candidate.id} 
                      className="group hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-[9px] text-[var(--text-muted)] uppercase tracking-tighter">
                        {candidate.id}
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                          {candidate.first_name} {candidate.last_name}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-[var(--text-muted)] font-mono text-[10px] font-bold">
                        {candidate.cin}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[var(--text-secondary)] font-medium text-[13px]">{candidate.email}</span>
                          <span className="text-[var(--text-muted)] text-[10px] font-mono">{candidate.phone}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-[var(--text-secondary)] text-xs">
                        {candidate.city}
                      </td>

                      <td className="px-6 py-4">
                        <p className="max-w-[200px] truncate text-[11px] text-[var(--text-muted)] italic">
                          {candidate.infos}
                        </p>
                      </td>
                      
                      <td className="px-6 py-4 text-right text-[10px] font-mono text-[var(--text-muted)]">
                        {new Date(candidate.created_at).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <User size={24} className="text-[var(--text-muted)]" />
                        <p className="text-[var(--text-muted)] text-sm">
                          {t.noCandidatesFound || 'No candidates found matching your search.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}