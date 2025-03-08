import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/common/Spinner";
import BarChart from "../components/dashboard/BarChart";
import ExpenseForm from "../components/dashboard/ExpenseForm";
import { getExpenses, reset } from "../features/expenses/expenseSlice";
import { getBills } from "../features/bills/billSlice";
import { getSavings } from "../features/savings/savingSlice";
import DatePicker from "react-tailwindcss-datepicker";
import { FiPlusCircle, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

// Import icons for the stats cards
import { 
  BsCashStack, 
  BsPiggyBank, 
  BsCalendar, 
  BsCreditCard,
  BsArrowUpCircle,
  BsArrowDownCircle,
  BsGraphUp,
  BsWallet2
} from 'react-icons/bs';

function Dashboard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state) => state.auth);
  const { expenses, isLoading, isError, message, totalExpense } = useSelector((state) => state.expenses);
  const { totalSaving } = useSelector((state) => state.savings);
  const { totalBill } = useSelector((state) => state.bills);

  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date()
  });

  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const categories = ["All Categories", "Food", "Shopping", "Travel", "Medical", "Movie"];

  // Calculate this month's expenses
  const thisMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const today = new Date();
    return expenseDate.getMonth() === today.getMonth() && 
           expenseDate.getFullYear() === today.getFullYear();
  }).reduce((acc, curr) => acc + curr.cost, 0);

  // Add new state for expense trends
  const [expenseTrend, setExpenseTrend] = useState({
    percentage: 0,
    isIncrease: false
  });

  useEffect(() => {
    if (isError) {
      console.log(message);
    }
    if (!user) {
      navigate("/");
    }
    
    dispatch(getExpenses());
    dispatch(getBills());
    dispatch(getSavings());

    return () => {
      dispatch(reset());
    };
  }, [user, navigate, isError, message, dispatch]);

  // Calculate expense trend
  useEffect(() => {
    if (expenses.length > 0) {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const thisMonthTotal = expenses.filter(expense => {
        const date = new Date(expense.date);
        return date.getMonth() === new Date().getMonth();
      }).reduce((acc, curr) => acc + curr.cost, 0);

      const lastMonthTotal = expenses.filter(expense => {
        const date = new Date(expense.date);
        return date.getMonth() === lastMonth.getMonth();
      }).reduce((acc, curr) => acc + curr.cost, 0);

      const trend = lastMonthTotal === 0 ? 0 : 
        ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;

      setExpenseTrend({
        percentage: Math.abs(trend).toFixed(1),
        isIncrease: trend > 0
      });
    }
  }, [expenses]);

  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
  };

  const statsCards = [
    {
      title: "Total Expense",
      value: totalExpense || 0,
      icon: <BsCashStack className="w-8 h-8 text-blue-500" />,
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      trend: expenseTrend
    },
    {
      title: "This month",
      value: thisMonthExpenses || 0,
      icon: <BsCalendar className="w-8 h-8 text-green-500" />,
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      title: "Total Savings",
      value: totalSaving || 0,
      icon: <BsPiggyBank className="w-8 h-8 text-purple-500" />,
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      title: "Total Bills",
      value: totalBill || 0,
      icon: <BsCreditCard className="w-8 h-8 text-red-500" />,
      bgColor: "bg-red-50 dark:bg-red-900/20"
    }
  ];

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with summary */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Welcome back, {user?.name}! 
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Here's your financial overview
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <BsWallet2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400">
            Balance: ₹{(totalSaving - totalExpense - totalBill).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <div 
            key={index}
            className={`${card.bgColor} rounded-xl p-6 transition-all duration-200 hover:shadow-lg`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  ₹ {card.value.toFixed(2)}
                </p>
                {card.trend && (
                  <div className={`flex items-center mt-2 ${
                    card.trend.isIncrease ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {card.trend.isIncrease ? 
                      <FiTrendingUp className="w-4 h-4 mr-1" /> : 
                      <FiTrendingDown className="w-4 h-4 mr-1" />
                    }
                    <span className="text-sm font-medium">
                      {card.trend.percentage}%
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-sm">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters with improved styling */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="w-72">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date Range
            </label>
            <DatePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              showShortcuts={true}
              primaryColor="blue"
              className="w-full p-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white min-w-[150px]"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Message when no expenses */}
      {expenses.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <BsGraphUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">No expenses recorded yet</p>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <FiPlusCircle className="w-5 h-5 mr-2" />
            Add your first expense
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Expense Trends
              </h3>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  expenseTrend.isIncrease ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {expenseTrend.isIncrease ? 
                    <BsArrowUpCircle className="w-3 h-3 mr-1" /> : 
                    <BsArrowDownCircle className="w-3 h-3 mr-1" />
                  }
                  {expenseTrend.percentage}%
                </span>
              </div>
            </div>
            <BarChart 
              expenses={expenses} 
              selectedDateRange={dateRange}
              selectedTag={selectedCategory}
            />
          </div>

          {/* Recent Expenses */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Recent Expenses
              </h3>
              <button
                onClick={() => setIsDialogOpen(true)}
                className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm"
              >
                <FiPlusCircle className="w-4 h-4 mr-1" />
                Add New
              </button>
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
              {expenses
                .filter(expense => 
                  selectedCategory === "All Categories" || 
                  expense.tag === selectedCategory
                )
                .slice(0, 5)
                .map(expense => (
                  <div 
                    key={expense._id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <span className="text-xl">{getExpenseIcon(expense.tag)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {expense.desc}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(expense.date).toLocaleDateString()}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
                            {expense.tag}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ₹{expense.cost.toFixed(2)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Button */}
      <button
        onClick={() => setIsDialogOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center group"
      >
        <FiPlusCircle className="w-6 h-6" />
        <span className="absolute right-full mr-2 bg-gray-900 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          Add Expense
        </span>
      </button>

      {/* Add Expense Modal */}
      {isDialogOpen && <ExpenseForm onClose={() => setIsDialogOpen(false)} />}
    </div>
  );
}

// Helper function to get expense icons
function getExpenseIcon(tag) {
  switch (tag.toLowerCase()) {
    case 'food': return '🍽️';
    case 'shopping': return '🛍️';
    case 'travel': return '✈️';
    case 'medical': return '💊';
    case 'movie': return '🎬';
    default: return '💰';
  }
}

export default Dashboard;
