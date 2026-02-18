import React, { useEffect, useState } from 'react';
import { re, Blog, Sport, BulkSyncRequest, TaskStatus } from '../lib/api';

const BulkSync: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [form, setForm] = useState<BulkSyncRequest>({
    blog_id: 0,
    sport_id: 0,
    generate_missing: true,
    regenerate_existing: false,
    status: '',
    older_than_days: undefined,
    limit: undefined,
    skip_throttle: false,
  });
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch blogs and sports on mount
  useEffect(() => {
    Promise.all([re.getBlogs(), re.getSports()])
      .then(([blogsRes, sportsRes]) => {
        setBlogs(blogsRes.data);
        setSports(sportsRes.data);
        if (blogsRes.data.length) setForm(f => ({ ...f, blog_id: blogsRes.data[0].id }));
        if (sportsRes.data.length) setForm(f => ({ ...f, sport_id: sportsRes.data[0].id }));
      })
      .catch(err => setError('Failed to load blogs/sports'));
  }, []);

  // Poll task status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (taskId) {
      const poll = async () => {
        try {
          const res = await re.getTask(taskId);
          setTaskStatus(res.data);
          if (res.data.status === 'completed' || res.data.status === 'failed') {
            clearInterval(interval);
          }
        } catch (err) {
          setError('Failed to fetch task status');
          clearInterval(interval);
        }
      };
      poll();
      interval = setInterval(poll, 2000);
    }
    return () => clearInterval(interval);
  }, [taskId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTaskId(null);
    setTaskStatus(null);
    try {
      const res = await re.startBulkSync(form);
      setTaskId(res.data.task_id);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to start sync');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setForm(prev => ({ ...prev, [name]: val }));
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h2>Bulk Article Sync</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Blog:</label>
          <select name="blog_id" value={form.blog_id} onChange={handleChange} required>
            <option value="">Select Blog</option>
            {blogs.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label>Sport:</label>
          <select name="sport_id" value={form.sport_id} onChange={handleChange} required>
            <option value="">Select Sport</option>
            {sports.map(s => <option key={s.id} value={s.id}>{s.title || s.name}</option>)}
          </select>
        </div>
        <div>
          <label>
            <input type="checkbox" name="generate_missing" checked={form.generate_missing} onChange={handleChange} />
            Generate missing articles
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" name="regenerate_existing" checked={form.regenerate_existing} onChange={handleChange} />
            Regenerate existing articles
          </label>
        </div>
        {form.regenerate_existing && (
          <>
            <div>
              <label>Status filter:</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="">Any</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="regenerated">Regenerated</option>
              </select>
            </div>
            <div>
              <label>Older than (days):</label>
              <input type="number" name="older_than_days" value={form.older_than_days || ''} onChange={handleChange} min="0" />
            </div>
          </>
        )}
        <div>
          <label>Limit (max articles):</label>
          <input type="number" name="limit" value={form.limit || ''} onChange={handleChange} min="1" />
        </div>
        <div>
          <label>
            <input type="checkbox" name="skip_throttle" checked={form.skip_throttle} onChange={handleChange} />
            Skip throttle delay (faster, but may hit rate limits)
          </label>
        </div>
        <button type="submit" disabled={loading}>Start Sync</button>
      </form>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      {taskId && (
        <div style={{ marginTop: 20 }}>
          <h3>Task ID: {taskId}</h3>
          <p>Status: {taskStatus?.status}</p>
          {taskStatus?.result && (
            <pre>{JSON.stringify(taskStatus.result, null, 2)}</pre>
          )}
          {taskStatus?.error && <div style={{ color: 'red' }}>Error: {taskStatus.error}</div>}
        </div>
      )}
    </div>
  );
};

export default BulkSync;