"use client";
import { useEffect, useState, useContext, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import Table from "antd/lib/table";
import { priceDisplay } from "@/utils/price";
import { SocketContext } from "@/context/Socket";
import Link from "next/link";

const Ticker = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["24init"],
    queryFn: () =>
      fetch("https://testnet.binance.vision/api/v3/ticker/24hr").then((res) =>
        res.json()
      ),
  });


  const [dataTable, setDataTable] = useState([]);
	const { subscribe, messageHistory } = useContext(SocketContext);

	const handleSubsribe = useCallback((method) => {
		subscribe({
			method: method,
			params: ["!ticker@arr"],
			id: 1,
		});
	}, [subscribe])

  useEffect(() => {
    setDataTable(data);
		handleSubsribe('SUBSCRIBE');
    return () => {
      handleSubsribe('UNSUBSCRIBE');
    };
	}, [data, handleSubsribe]);


	useEffect(() => {
		if (messageHistory?.data) {
			const streamData = JSON.parse(messageHistory?.data);
			if (streamData?.stream === '!ticker@arr') {
				const m = streamData.data.map((item) => ({
					"symbol": item.s,
					"priceChange": item.p,
					"priceChangePercent": item.P,
					"weightedAvgPrice": item.w,
					"prevClosePrice": item.c,
					"lastPrice": item.c,
					"lastQty": item.q,
					"bidPrice": 0,
					"bidQty": 0,
					"askPrice": 0,
					"askQty": 0,
					"openPrice": item.o,
					"highPrice": item.h,
					"lowPrice": item.l,
					"volume": item.v,
					"quoteVolume": item.q,
					"openTime": item.O,
					"closeTime": item.C,
					"firstId": item.F,
					"lastId": item.L,
					"count": item.n
				}))
				
				const update = data?.map((item) => {
					const f = m.find((i) => i.symbol === item.symbol)
					if (f) {
						return f;
					} 
					return item;
				});
				setDataTable(update);
			}
		}
	}, [data, messageHistory]);
  

  const columns = [
    {
      title: "Market",
      dataIndex: "symbol",
      key: "symbol",
      render: (text) => (<Link href={text}>{text}</Link>),
    },
    {
      title: "Last Price",
      dataIndex: "lastPrice",
      key: "lastPrice",
      render: (text) => priceDisplay(text),
    },
    {
      title: "24 Hours Volume",
      dataIndex: "quoteVolume",
      key: "quoteVolume",
      render: (text) => priceDisplay(text),
    },
    {
      title: "24 Hours Change",
      dataIndex: "priceChangePercent",
      key: "priceChangePercent",
      render: (text) => {
        const n = Number(text);
        if (n >= 0) {
          return <span className="text-teal-400">{n}%</span>;
        }
        return <span className="text-red-400">{n}%</span>;
      },
    },
  ];

  if (isLoading) {
    return (
      <div>Loading...</div>
    )
  }
  return (
    <div>
      <Table
        key="24h"
        columns={columns}
        dataSource={dataTable}
        pagination={{
          pageSize: 100,
        }}
        loading={isLoading}
      />
    </div>
  );
};

export default Ticker;
