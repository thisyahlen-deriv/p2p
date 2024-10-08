import { useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MY_ADS_URL } from '@/constants';
import useInvalidateQuery from '@/hooks/api/useInvalidateQuery';
import { Localize } from '@deriv-com/translations';
import { Button, Checkbox, Modal, Text, useDevice } from '@deriv-com/ui';
import { LocalStorageConstants, LocalStorageUtils } from '@deriv-com/utils';
import './AdCreateEditSuccessModal.scss';

export type TAdCreateEditSuccessModalProps = {
    advertsArchivePeriod?: number;
    isModalOpen: boolean;
    onRequestClose: () => void;
};

const AdCreateEditSuccessModal = ({
    advertsArchivePeriod,
    isModalOpen,
    onRequestClose,
}: TAdCreateEditSuccessModalProps) => {
    const { isDesktop } = useDevice();
    const invalidate = useInvalidateQuery();
    const history = useHistory();
    const [isChecked, setIsChecked] = useState(false);
    const textSize = isDesktop ? 'sm' : 'md';
    const onToggleCheckbox = useCallback(() => {
        setIsChecked(prevState => !prevState);
    }, []);

    const onClickOk = () => {
        if (isChecked) {
            LocalStorageUtils.setValue<boolean>(LocalStorageConstants.p2pArchiveMessage, isChecked);
        }
        history.push(MY_ADS_URL);

        invalidate('p2p_advertiser_adverts');
        onRequestClose();
    };
    return (
        <Modal ariaHideApp={false} className='ad-create-edit-success-modal' isOpen={isModalOpen}>
            <Modal.Header hideBorder hideCloseIcon>
                <Text weight='bold'>
                    <Localize i18n_default_text='You’ve created an ad' />
                </Text>
            </Modal.Header>
            <Modal.Body className='ad-create-edit-success-modal__body'>
                <Text color='prominent' size={textSize}>
                    <Localize
                        i18n_default_text="If the ad doesn't receive an order for {{advertsArchivePeriod}} days, it will be deactivated."
                        values={{ advertsArchivePeriod }}
                    />
                </Text>
                <Checkbox
                    checked={isChecked}
                    label={<Localize i18n_default_text='Don’t show this message again.' />}
                    name='ad-create-success-message'
                    onChange={onToggleCheckbox}
                />
            </Modal.Body>
            <Modal.Footer hideBorder>
                <Button onClick={onClickOk} size='lg' textSize={textSize}>
                    <Localize i18n_default_text='OK' />
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AdCreateEditSuccessModal;
