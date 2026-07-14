import React from "react";

function VID({ url }: { url: string }) {
  return <video src={url} controls className="w-[320px] rounded-md border" />;
}

export default React.memo(VID);
