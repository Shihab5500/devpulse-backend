import { Response } from 'express';
import { pool } from '../config/db';
import { AuthRequest } from '../middlewares/authMiddleware';

// ১. ইস্যু তৈরি করা
export const createIssue = async (req: AuthRequest, res: Response) => {
  const { title, description, type } = req.body;
  const reporter_id = req.user?.id;

  if (!title || !description || !type || !reporter_id) {
    res.status(400).json({ success: false, message: 'Invalid input data' });
    return;
  }

  try {
    const result = await pool.query(
      'INSERT INTO issues (title, description, type, reporter_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, type, reporter_id]
    );

    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ২. সব ইস্যু দেখা (No JOIN Challenge)
export const getAllIssues = async (req: AuthRequest, res: Response) => {
  const { sort, type, status } = req.query;

  try {
    let queryText = 'SELECT * FROM issues WHERE 1=1';
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (type) {
      queryText += ` AND type = $${paramIndex}`;
      queryParams.push(type);
      paramIndex++;
    }

    if (status) {
      queryText += ` AND status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    if (sort === 'oldest') {
      queryText += ' ORDER BY created_at ASC';
    } else {
      queryText += ' ORDER BY created_at DESC';
    }

    const issuesResult = await pool.query(queryText, queryParams);
    const issues = issuesResult.rows;

    if (issues.length === 0) {
      res.status(200).json({ success: true, data: [] });
      return;
    }

    // চ্যালেঞ্জ সমাধান: JOIN ছাড়া আলাদা কুয়েরি দিয়ে রিপোর্টারের ডাটা আনা
    const reporterIds = Array.from(new Set(issues.map(i => i.reporter_id)));
    const usersResult = await pool.query(
      `SELECT id, name, role FROM users WHERE id IN (${reporterIds.join(',')})`
    );
    
    const userMap: any = {};
    usersResult.rows.forEach(u => {
      userMap[u.id] = u;
    });

    const finalData = issues.map(issue => {
      const { reporter_id, ...rest } = issue;
      return {
        ...rest,
        reporter: userMap[reporter_id] || null
      };
    });

    res.status(200).json({ success: true, data: finalData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ৩. একটি নির্দিষ্ট ইস্যু দেখা
export const getSingleIssue = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const issueResult = await pool.query('SELECT * FROM issues WHERE id = $1', [id]);
    const issue = issueResult.rows[0];

    if (!issue) {
      res.status(404).json({ success: false, message: 'Issue not found' });
      return;
    }

    const userResult = await pool.query('SELECT id, name, role FROM users WHERE id = $1', [issue.reporter_id]);
    const { reporter_id, ...rest } = issue;

    res.status(200).json({
      success: true,
      data: {
        ...rest,
        reporter: userResult.rows[0] || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ৪. ইস্যু আপডেট করা
export const updateIssue = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, description, type } = req.body;
  const currentUser = req.user;

  try {
    const issueCheck = await pool.query('SELECT * FROM issues WHERE id = $1', [id]);
    const issue = issueCheck.rows[0];

    if (!issue) {
      res.status(404).json({ success: false, message: 'Issue not found' });
      return;
    }

    // পারমিশন রুলস চেক
    if (currentUser?.role !== 'maintainer') {
      if (issue.reporter_id !== currentUser?.id || issue.status !== 'open') {
        res.status(403).json({ success: false, message: 'Access forbidden: Insufficient permissions' });
        return;
      }
    }

    const updatedTitle = title || issue.title;
    const updatedDesc = description || issue.description;
    const updatedType = type || issue.type;

    const result = await pool.query(
      'UPDATE issues SET title = $1, description = $2, type = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [updatedTitle, updatedDesc, updatedType, id]
    );

    res.status(200).json({
      success: true,
      message: 'Issue updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ৫. ইস্যু ডিলিট করা
export const deleteIssue = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const currentUser = req.user;

  if (currentUser?.role !== 'maintainer') {
    res.status(403).json({ success: false, message: 'Access forbidden: Maintainers only' });
    return;
  }

  try {
    const check = await pool.query('SELECT * FROM issues WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Issue not found' });
      return;
    }

    await pool.query('DELETE FROM issues WHERE id = $1', [id]);
    res.status(200).json({ success: true, message: 'Issue deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};