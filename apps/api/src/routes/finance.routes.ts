import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import * as ctrl from '../controllers/finance.controller';

const router = Router();
router.use(requireAuth);

router.get('/dashboard',                    ctrl.getFinanceDashboard);
router.get('/report/:year/:month',          ctrl.getFinanceReport);

router.get('/transactions',                 ctrl.listTransactions);
router.post('/transactions',                ctrl.createTransaction);
router.patch('/transactions/:id',           ctrl.updateTransaction);
router.delete('/transactions/:id',          ctrl.deleteTransaction);
router.get('/transactions/summary',         ctrl.getTransactionSummary);

router.get('/budgets',                      ctrl.listBudgets);
router.post('/budgets',                     ctrl.createBudget);
router.patch('/budgets/:id',                ctrl.updateBudget);
router.delete('/budgets/:id',               ctrl.deleteBudget);
router.get('/budgets/alert',                ctrl.getBudgetAlerts);

router.get('/goals',                        ctrl.listFinancialGoals);
router.post('/goals',                       ctrl.createFinancialGoal);
router.patch('/goals/:id',                  ctrl.updateFinancialGoal);
router.delete('/goals/:id',                 ctrl.deleteFinancialGoal);
router.post('/goals/:id/contribute',        ctrl.contributeToGoal);

export default router;
