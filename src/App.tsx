import { useEffect, useMemo, useState } from "react";
import Loader from "./components/Loader";
import Table from "./components/Table";
import { ProcessListEnum } from "./longProcesses/enums";
import "./index.css";
import Pagination from "./components/Pagination";

type LengthCountType = {
  loading: boolean;
  value: number;
};

export type ProfileType = {
  albumId: number | string;
  id: number | string;
  title: string;
  url: string;
  thumbnailUrl: string;
};

export type ProfileListType = {
  loading: boolean;
  list: unknown & Array<ProfileType>;
  page: number;
};

export type GetDataType = {
  action: string;
  period: "initial" | "next" | "prev" | "pageNumber";
  thePageNumber: number;
};

export const listPageSize = 50;

const App = () => {
  const [lengthCount, setLengthCount] = useState<LengthCountType>({
    loading: true,
    value: 0,
  });

  const [profileList, setProfileList] = useState<ProfileListType>({
    loading: true,
    list: [],
    page: 1,
  });

  const counter: Worker = useMemo(
    () => new Worker(new URL("./longProcesses/count.ts", import.meta.url)),
    []
  );

  const getData: Worker = useMemo(
    () => new Worker(new URL("./longProcesses/getData.ts", import.meta.url)),
    []
  );

  useEffect(() => {
    if (window.Worker) {
      console.log("[Worker] count - emitting message...");
      counter.postMessage(ProcessListEnum.count);
    }
  }, [counter]);

  useEffect(() => {
    if (window.Worker) {
      console.log('[Worker] count - register "onmessage" listener...');
      counter.onmessage = (e: MessageEvent<string>) => {
        setLengthCount((prev) => ({
          ...prev,
          loading: false,
          value: Number(e.data) && Number(e.data),
        }));
      };
    }
  }, [counter]);

  useEffect(() => {
    if (window.Worker) {
      console.log("[Worker] getData - emitting message...");
      const request = {
        action: ProcessListEnum.getData,
        period: "initial",
        thePageNumber: profileList.page,
      };

      getData.postMessage(JSON.stringify(request));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (window.Worker) {
      console.log('[Worker] getData - register "onmessage" listener...');
      getData.onmessage = (e: MessageEvent<string>) => {
        const response = JSON.parse(e.data) as unknown as ProfileListType;
        setProfileList((prev) => ({
          ...prev,
          loading: response.loading,
          list: response.list,
          page: response.page,
        }));
      };
    }
  }, [getData]);

  //
  const handlePageNumber = (userSelectedPage: number) => {
    if (window.Worker) {
      const request: GetDataType = {
        action: ProcessListEnum.getData,
        period: "pageNumber",
        thePageNumber: userSelectedPage,
      };
      getData.postMessage(JSON.stringify(request));
    }
  };

  const prevHandler = (userSelectedPage: number) => {
    if (profileList.page === 1) {
      return;
    }

    if (window.Worker) {
      const request = {
        action: ProcessListEnum.getData,
        period: "prev",
        thePageNumber: userSelectedPage - 1,
      } as GetDataType;

      getData.postMessage(JSON.stringify(request));
    }
  };
  const nextHandler = (userSelectedPage: number, thePageLength: number) => {
    if (userSelectedPage < thePageLength) {
      if (window.Worker) {
        const request = {
          action: ProcessListEnum.getData,
          period: "next",
          thePageNumber: userSelectedPage + 1,
        } as GetDataType;

        getData.postMessage(JSON.stringify(request));
      }
    }
  };

  return (
    <main className="main-container">
      <section className="count">
        Total count of Profiles is{" "}
        <b>{lengthCount.loading ? <Loader size={14} /> : lengthCount.value}</b>
      </section>
      <section className="table-container">
        {profileList.loading ? (
          <Loader size={40} />
        ) : (
          <Table list={profileList.list} />
        )}
      </section>
      <Pagination
        page={profileList.page}
        pages={lengthCount.value / listPageSize}
        pageClick={(pageNumber) => handlePageNumber(pageNumber)}
        prevHandler={() => prevHandler(profileList.page)}
        nextHandler={() =>
          nextHandler(profileList.page, lengthCount.value / listPageSize)
        }
      />
    </main>
  );
};

export default App;
