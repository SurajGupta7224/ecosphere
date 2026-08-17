import React from 'react';
import DatePickerLib from 'react-datepicker';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';

export default function DatePicker({ value, onChange, minDate = new Date() }) {
  const selectedDate = value ? new Date(value + 'T00:00:00') : null;

  const formatToYMD = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  return (
    <div className="relative ecosphere-datepicker">
      <DatePickerLib
        selected={selectedDate}
        onChange={(date) => onChange(formatToYMD(date))}
        minDate={minDate}
        dateFormat="dd MMM, yyyy"
        placeholderText="Select date"
        popperPlacement="bottom-start"
        wrapperClassName="w-full"
        renderCustomHeader={({ date, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => (
          <div className="flex items-center justify-between px-2 pb-3 mb-1 border-b border-slate-100">
            <span className="text-sm font-bold text-slate-800">
              {date.toLocaleString('default', { month: 'long' })} {date.getFullYear()}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={increaseMonth}
                disabled={nextMonthButtonDisabled}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        customInput={
          <CustomInput />
        }
      />
    </div>
  );
}

const CustomInput = React.forwardRef(({ value, onClick, placeholder }, ref) => (
  <div className="relative w-full" onClick={onClick} ref={ref}>
    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    <input
      readOnly
      value={value || ''}
      placeholder={placeholder}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-1 focus:ring-[#84cc16] focus:border-[#84cc16] transition-all text-sm font-medium text-slate-700 cursor-pointer"
    />
  </div>
));