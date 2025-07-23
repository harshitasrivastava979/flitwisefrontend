import { 
  Users,  
  DollarSign,
  Receipt,
  Calendar
} from "lucide-react";

export default function Activity() {
  const activities = [
    { title: "John added 'Grocery Shopping' in House Expenses", amount: "₹726.00", owed: "₹242.00", time: "2 hours ago", type: "expense", user: "John" },
    { title: "Sarah settled up with you", amount: "₹450.00", owed: "settled", time: "5 hours ago", type: "settlement", user: "Sarah" },
    { title: "Mike added 'Movie Tickets' in Weekend Fun", amount: "₹300.00", owed: "₹100.00", time: "1 day ago", type: "expense", user: "Mike" },
    { title: "You added 'Coffee & Snacks' in Office Lunch", amount: "₹154.00", owed: "You paid", time: "2 days ago", type: "expense", user: "You" },
    { title: "Lisa joined 'Trip to Vegas' group", amount: "", owed: "", time: "3 days ago", type: "group", user: "Lisa" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Activity</h1>
        <p className="text-gray-600 mt-1">Recent transactions and updates</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {activities.map((item, index) => (
            <div key={index} className="flex items-start space-x-4 p-6 hover:bg-gray-50 transition-colors">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                item.type === 'expense' ? 'bg-orange-100' : 
                item.type === 'settlement' ? 'bg-green-100' : 'bg-blue-100'
              }`}>
                {item.type === 'expense' ? 
                  <Receipt className="w-6 h-6 text-orange-600" /> :
                  item.type === 'settlement' ?
                  <DollarSign className="w-6 h-6 text-green-600" /> :
                  <Users className="w-6 h-6 text-blue-600" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 leading-relaxed">{item.title}</p>
                {item.amount && (
                  <p className="text-sm text-gray-600 mt-1">
                    {item.amount}
                    {item.owed && item.owed !== 'settled' && item.owed !== 'You paid' && ` • ${item.owed}`}
                    {item.owed === 'settled' && ` • Settled`}
                    {item.owed === 'You paid' && ` • You paid`}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2 flex items-center space-x-2">
                  <Calendar className="w-3 h-3" />
                  <span>{item.time}</span>
                </p>
              </div>
              {item.type === 'settlement' && (
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Settled
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
