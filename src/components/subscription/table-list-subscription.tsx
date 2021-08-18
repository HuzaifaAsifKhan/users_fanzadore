import React from 'react';
import { Table, Tag, Button } from 'antd';
import { ISubscription } from 'src/interfaces';
import { formatDate, formatDateNoTime } from '@lib/date';
import Link from 'next/link';

interface IProps {
  dataSource: ISubscription[];
  // eslint-disable-next-line react/require-default-props
  pagination?: any;
  // eslint-disable-next-line react/require-default-props
  rowKey?: string;
  onChange: any;
  loading: boolean;
  cancelSubscription: Function;
}

export const TableListSubscription = ({
  dataSource,
  pagination,
  rowKey,
  onChange,
  loading,
  cancelSubscription
}: IProps) => {
  const onCancel = (value) => {
    if (
      !window.confirm(
        'By aggree to cancel this performer subscription, your will not able to access this performer immediately '
      )
    ) {
      return;
    }
    cancelSubscription(value);
  };
  const columns = [
    {
      title: 'Model',
      dataIndex: 'performerInfo',
      render(data, records) {
        return (
          <Link
            href={{
              pathname: '/model/profile',
              query: { username: records?.performerInfo?.username }
            }}
            as={`/model/${records?.performerInfo?.username}`}
          >
            <a>
              {records?.performerInfo?.username || 'N/A'}
            </a>
          </Link>
        );
      }
    },
    {
      title: 'Type',
      dataIndex: 'subscriptionType',
      render(subscriptionType: string) {
        switch (subscriptionType) {
          case 'monthly':
            return <Tag color="orange">Monthly Subscription</Tag>;
          case 'yearly':
            return <Tag color="orange">Yearly Subscription</Tag>;
          case 'system':
            return <Tag color="orange">System</Tag>;
          default:
            return null;
        }
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render(status: string) {
        switch (status) {
          case 'active':
            return <Tag color="success">Active</Tag>;
          case 'deactivated':
            return <Tag color="red">Deactivated</Tag>;
          default:
            return <Tag color="default">{status}</Tag>;
        }
      }
    },
    {
      title: 'Expired Date',
      dataIndex: 'expiredAt',
      render(date: Date) {
        return <span>{formatDateNoTime(date)}</span>;
      }
    },
    {
      title: 'Next Recurring Date',
      dataIndex: 'nextRecurringDate',
      render(date: Date) {
        return <span>{formatDateNoTime(date)}</span>;
      }
    },
    {
      title: 'Last updated at',
      dataIndex: 'updatedAt',
      sorter: true,
      render(date: Date) {
        return <span>{formatDate(date)}</span>;
      }
    },
    {
      title: 'Actions',
      dataIndex: '_id',
      sorter: false,
      render(_id, record) {
        return (
          <>
            {record.subscriptionType !== 'system'
              && record.status !== 'deactivated' && (
                <Button danger onClick={() => onCancel(record.performerId)}>
                  Cancel subscription
                </Button>
            )}
          </>
        );
      }
    }
  ];
  return (
    <div className="table-responsive">
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey={rowKey}
        pagination={pagination}
        onChange={onChange}
        loading={loading}
      />
    </div>
  );
};
