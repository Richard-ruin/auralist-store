import React from 'react';

const Loading = () => {
 return (
   <div className="flex items-center justify-center h-96">
     <div className="relative">
       {/* Outer ring */}
       <div className="w-16 h-16 rounded-full border-4 border-indigo-200 animate-[spin_2s_linear_infinite]"/>
       
       {/* Inner ring */}
       <div className="absolute top-0 w-16 h-16">
         <div className="w-16 h-16 rounded-full border-4 border-t-indigo-600 animate-[spin_1.5s_linear_infinite]"/>
       </div>
       
       {/* Loading text */}
       <div className="mt-4 text-center text-indigo-600 font-medium animate-pulse">
         Loading...
       </div>
     </div>
   </div>
 );
};

export default Loading;