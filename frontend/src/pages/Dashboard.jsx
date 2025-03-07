import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/common/Spinner";
import BarChart from "../components/dashboard/BarChart";
import DisplayExpenses from "../components/dashboard/DisplayExpenses";
import ExpenseForm from "../components/dashboard/ExpenseForm";
import FilterButton from "../components/dashboard/FIlterButton";
import ProgressBar from "../components/dashboard/ProgressBar";
import TotalsBar from "../components/dashboard/TotalsBar";
import { getExpenses, reset } from "../features/expenses/expenseSlice";
import filterLogo from "../images/filter.png";
import ReceiptUpload from '../components/dashboard/ReceiptUpload';


function Dashboard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReceiptUploadOpen, setIsReceiptUploadOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { expenses, isLoading, isError, message } = useSelector(
    (state) => state.expenses
  );
  const { savings, totalSaving } = useSelector((state) => state.savings);
  const data = expenses;
  const [selectedDate, setSelectedDate] = useState("View All");
  const [selectedTag, setSelectedTag] = useState("All Categories");

  const handleDateSelect = (option) => {
    setSelectedDate(option);
  };

  const handleTagSelect = (option) => {
    setSelectedTag(option);
  };

  useEffect(() => {
    if (isError) {
      console.log(message);
    }
    if (!user) {
      navigate("/");
    }
    dispatch(getExpenses());

    return () => {
      dispatch(reset());
    };
  }, [user, navigate, isError, message, dispatch]);

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const filteredData = data.filter((item) => {
    const dateFilter =
      selectedDate === "Last 7 Days"
        ? new Date(item.date) >=
        new Date(new Date().setDate(new Date().getDate() - 7))
        : selectedDate === "This Month"
          ? new Date(item.date) >=
          new Date(new Date().setMonth(new Date().getMonth() - 1))
          : true;

    const tagFilter =
      selectedTag === "All Categories" || selectedTag === item.tag;

    return dateFilter && tagFilter;
  });

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">
                <span className="text-blue-500">Spend</span>
                <span className="text-gray-700">Wise</span>
              </h1>
            </div>
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">{user.name}</span>
                <img 
                  src={user.image} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500 ring-offset-2 hover:scale-105 transition-transform duration-200"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-gray-600 mt-1">
            Here's an overview of your spending
          </p>
        </section>

        <TotalsBar expenses={data} />
        
        {expenses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">
              Start tracking your expenses by adding your first entry
            </p>
          </div>
        ) : (
          <div className="flex md:ml-[3%] md:flex-row flex-col">
            <div className=" md:w-[65%]">
              <div className="">
                <div className="inline-block nuns-font-700 text-[20px] md:mr-[20px] md:ml-0 ml-8">
                  Filter
                  <img src={filterLogo} className="w-[15px] inline mx-[5px]"></img>:
                </div>
                <FilterButton
                  options={["Last 7 Days", "This Month", "View All"]}
                  onSelect={handleDateSelect}
                  initialValue={selectedDate}
                />
                <FilterButton
                  options={["All Categories", "Food", "Movie", "Travel", "Medical", "Shopping"]}
                  onSelect={handleTagSelect}
                  initialValue={selectedTag}
                />
              </div>
              <DisplayExpenses expenses={filteredData} />
            </div>
            <div className="md:w-[33%] mx-[3%] md:mx-8">
              <ProgressBar expenses={data} />
              <BarChart expenses={expenses} />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="fixed md:bottom-6 right-6 bottom-20 flex flex-col gap-4">
          <button
            onClick={() => setIsReceiptUploadOpen(true)}
            className="bg-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 w-12 h-12 rounded-full flex items-center justify-center"
            title="Scan Receipt"
          >
            <span className="text-xl">📷</span>
          </button>
          <button
            onClick={openDialog}
            className="bg-blue-500 text-white shadow-lg hover:shadow-xl hover:bg-blue-600 transform hover:-translate-y-1 transition-all duration-200 w-12 h-12 rounded-full flex items-center justify-center"
            title="Add Expense"
          >
            <span className="text-2xl">+</span>
          </button>
        </div>

        {/* Modals */}
        {isDialogOpen && <ExpenseForm onClose={closeDialog} />}
        {isReceiptUploadOpen && <ReceiptUpload onClose={() => setIsReceiptUploadOpen(false)} />}
      </div>
    </div>
  );
}

export default Dashboard;
