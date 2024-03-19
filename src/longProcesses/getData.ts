import { GetDataType, ProfileListType, listPageSize } from "../App";
import { profiles } from "../data";
import { ProcessListEnum } from "./enums";

self.onmessage = (e: MessageEvent<string>) => {
  console.log("[Worker] getData message received:", e.data);
  const data = JSON.parse(e.data) as GetDataType;
  if (data.action !== ProcessListEnum.getData) {
    return;
  }
  if (data.period == "initial") {
    const items = profiles.filter((_, index) => index < listPageSize);
    const response = {
      loading: false,
      list: items,
      page: data.thePageNumber,
    };
    self.postMessage(JSON.stringify(response));
  }

  if (["next", "prev", "pageNumber"].includes(data.period)) {
    const items = profiles.slice(
      (data.thePageNumber - 1) * listPageSize,
      data.thePageNumber * listPageSize
    );

    const response = {
      loading: false,
      list: items,
      page: data.thePageNumber,
    } as ProfileListType;

    self.postMessage(JSON.stringify(response));
  }
};

export {};
