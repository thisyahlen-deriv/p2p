import { TAdvertsTableRowRenderer, TLocalize } from 'types';
import { AdvertsTableRow, Table } from '@/components';
import { DerivLightIcNoDataIcon } from '@deriv/quill-icons';
import { Localize, useTranslations } from '@deriv-com/translations';
import { ActionScreen, Loader, Text } from '@deriv-com/ui';

const getColumns = (localize: TLocalize) => [
    { header: localize('Limits') },
    { header: localize('Rate (1 USD)') },
    { header: localize('Payment methods') },
];

const headerRenderer = (header: string) => <span>{header}</span>;

type TAdvertsTableRenderer = {
    data?: TAdvertsTableRowRenderer[];
    isLoading: boolean;
    loadMoreAdverts: () => void;
};

const AdvertsTableRenderer = ({ data, isLoading, loadMoreAdverts }: TAdvertsTableRenderer) => {
    const { localize } = useTranslations();
    if (isLoading) {
        return <Loader className='relative mt-40 top-0' />;
    }

    if (!data) {
        return (
            <div className='p-16 lg:p-12'>
                <ActionScreen
                    icon={<DerivLightIcNoDataIcon height='128px' width='128px' />}
                    title={
                        <Text weight='bold'>
                            <Localize i18n_default_text='There are no ads yet' />
                        </Text>
                    }
                />
            </div>
        );
    }
    return (
        <Table
            columns={getColumns(localize)}
            data={data}
            emptyDataMessage={localize('There are no matching ads.')}
            loadMoreFunction={loadMoreAdverts}
            renderHeader={headerRenderer}
            rowRender={(data: unknown) => <AdvertsTableRow {...(data as TAdvertsTableRowRenderer)} />}
            tableClassname=''
        />
    );
};

export default AdvertsTableRenderer;
