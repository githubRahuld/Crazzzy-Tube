import React from "react";
import { Spinner } from "@nextui-org/react";
function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center">
        <Spinner
          color="warning"
          size="large"
          className="w-20 h-20 text-yellow-500"
        />
        <span className="mt-2 text-yellow-500 text-lg font-bold">
          Loading...
        </span>
      </div>
    </div>
  );
}

export default Loading;
