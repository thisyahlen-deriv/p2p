import { ChangeEvent } from 'react';
import { TCountryListItem, TInitialData, TLocalize } from 'types';
import { ERROR_CODES, RATE_TYPE } from '@/constants';
import { localize } from '@deriv-com/translations';
import { rangeValidator } from './format-value';
import { countDecimalPlaces, decimalValidator } from './string';

/**
 * Determines whether to show a tooltip icon based on the visibility status.
 * A tooltip icon should be shown if:
 * - There is only one visibility status and it is not equal to `ERROR_CODES.ADVERT_INACTIVE`
 *   or `ERROR_CODES.ADVERTISER_ADS_PAUSED`.
 * - There are multiple visibility statuses.
 *
 * @param {string[]} visibilityStatus - The array of visibility statuses.
 * @returns {boolean} Returns `true` if a tooltip icon should be shown, otherwise `false`.
 */
export const shouldShowTooltipIcon = (visibilityStatus: string[]) =>
    (visibilityStatus?.length === 1 &&
        visibilityStatus[0] !== ERROR_CODES.ADVERT_INACTIVE &&
        visibilityStatus[0] !== ERROR_CODES.ADVERTISER_ADS_PAUSED) ||
    visibilityStatus.length > 1;

/**
 * Determines the visibility error codes based on the provided parameters.
 *
 * @param {string[]} visibilityStatus - The array of existing visibility status codes.
 * @param {boolean} enableActionPoint - A boolean indicating whether the action point is enabled.
 * @param {boolean} isAdvertListed - A boolean indicating whether the advert is listed.
 * @returns {string[]} Returns an updated array of visibility status codes.
 */
export const getVisibilityErrorCodes = (
    visibilityStatus: string[],
    enableActionPoint: boolean,
    isAdvertListed: boolean
) => {
    let updatedVisibilityStatus = [...visibilityStatus];
    if (!isAdvertListed && !updatedVisibilityStatus.includes(ERROR_CODES.ADVERTISER_ADS_PAUSED))
        updatedVisibilityStatus = [...updatedVisibilityStatus, ERROR_CODES.ADVERTISER_ADS_PAUSED];
    if (!enableActionPoint && updatedVisibilityStatus.includes(ERROR_CODES.ADVERT_INACTIVE))
        updatedVisibilityStatus = updatedVisibilityStatus.filter(status => status !== ERROR_CODES.ADVERT_INACTIVE);
    if (enableActionPoint && !updatedVisibilityStatus.includes(ERROR_CODES.ADVERT_INACTIVE))
        updatedVisibilityStatus = [...updatedVisibilityStatus, ERROR_CODES.ADVERT_INACTIVE];
    return updatedVisibilityStatus;
};

type ValidationRules = {
    [key: string]: (value: string) => boolean | string;
};

const requiredValidation = (value: string, field: string) => !!value || localize('{{field}} is required', { field });
const decimalPointValidation = (value: string) =>
    (Number(value) > 0 && decimalValidator(value) && countDecimalPlaces(value) <= 2) ||
    localize('Only up to 2 decimals are allowed.');
export const getValidationRules = (
    fieldName: string,
    getValues: (fieldName: string) => number | string
): ValidationRules => {
    switch (fieldName) {
        case 'amount':
            return {
                validation_1: value => requiredValidation(value, localize('Amount')),
                validation_2: value => !isNaN(Number(value)) || localize('Enter a valid amount'),
                validation_3: value => decimalPointValidation(value),
                validation_4: value => {
                    const minOrder = getValues('min-order');
                    if (minOrder && Number(value) < Number(minOrder)) {
                        return localize('Amount should not be below Min limit');
                    }
                    return true;
                },
                validation_5: value => {
                    const maxOrder = getValues('max-order');
                    if (maxOrder && Number(value) < Number(maxOrder)) {
                        return localize('Amount should not be below Max limit');
                    }
                    return true;
                },
            };
        case 'rate-value':
            return {
                validation_1: value =>
                    requiredValidation(
                        value,
                        getValues('rate-type-string') === RATE_TYPE.FIXED ? 'Fixed rate' : 'Floating rate'
                    ),
                validation_2: value => !isNaN(Number(value)) || localize('Enter a valid amount'),
                validation_3: value => {
                    if (getValues('rate-type-string') === RATE_TYPE.FIXED) {
                        return decimalPointValidation(value);
                    }
                    return true;
                },
                validation_4: value => {
                    const limitValue = getValues('float-rate-offset-limit');
                    if (
                        value &&
                        getValues('rate-type-string') === RATE_TYPE.FLOAT &&
                        !rangeValidator(parseFloat(value), Number(limitValue))
                    ) {
                        return localize("Enter a value that's within -{{limitValue}}% to +{{limitValue}}%", {
                            limitValue,
                        });
                    }
                    return true;
                },
            };
        case 'min-order':
            return {
                validation_1: value => requiredValidation(value, localize('Min limit')),
                validation_2: value => !isNaN(Number(value)) || localize('Only numbers are allowed.'),
                validation_3: value => decimalPointValidation(value),
                validation_4: value => {
                    const amount = getValues('amount');
                    if (getValues('amount') && Number(value) > Number(amount)) {
                        return localize('Min limit should not exceed Amount');
                    }
                    return true;
                },
                validation_5: value => {
                    const maxOrder = getValues('max-order');
                    if (maxOrder && Number(value) > Number(maxOrder)) {
                        return localize('Min limit should not exceed Max limit');
                    }
                    return true;
                },
            };
        case 'max-order':
            return {
                validation_1: value => requiredValidation(value, localize('Max limit')),
                validation_2: value => !isNaN(Number(value)) || 'Only numbers are allowed.',
                validation_3: value => decimalPointValidation(value),
                validation_4: value => {
                    const amount = getValues('amount');
                    if (amount && Number(value) > Number(amount)) {
                        return localize('Max limit should not exceed Amount');
                    }
                    return true;
                },
                validation_5: value => {
                    const minOrder = getValues('min-order');
                    if (minOrder && Number(value) < Number(minOrder)) {
                        return localize('Max limit should not be below Min limit');
                    }
                    return true;
                },
            };
        default:
            return {};
    }
};

export const getFilteredCountryList = (countryList: TCountryListItem, paymentMethods?: string[]) => {
    if (!paymentMethods || paymentMethods?.length === 0) return countryList;
    return (
        countryList &&
        Object.keys(countryList)
            .filter(key => {
                const paymentMethodsKeys = Object.keys(countryList[key]?.payment_methods || {});
                return paymentMethods.some(method => paymentMethodsKeys.includes(method));
            })
            .reduce((obj: TCountryListItem, key) => {
                obj[key] = countryList[key];
                return obj;
            }, {})
    );
};

export const restrictDecimalPlace = (
    e: ChangeEvent<HTMLInputElement>,
    handleChangeCallback: (e: ChangeEvent<HTMLInputElement>) => void
): void => {
    const pattern = /^[+-]?\d{0,4}(\.\d{0,2})?$/;
    if ((e.target as HTMLInputElement).value.length > 8) {
        (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.slice(0, 8);
        return;
    }
    if (pattern.test((e.target as HTMLInputElement).value)) {
        handleChangeCallback(e);
    }
};

/**
 * The below function is used to get the eligibility error message based on the error codes.
 * @param {string[]} errorCodes - The array of error codes.
 * @returns {string} - The error message.
 */
export const getEligibilityErrorMessage = (errorCodes: string[], localize: TLocalize) => {
    const errorMessages: { [key: string]: string } = {
        completion_rate: localize('Your completion rate is too low for this ad.'),
        join_date: localize("You've not used Deriv P2P long enough for this ad."),
    };

    if (errorCodes.length === 1 && errorMessages[errorCodes[0]]) {
        return errorMessages[errorCodes[0]];
    }

    return localize("The advertiser has set conditions for this ad that you don't meet.");
};

const isPaymentMethodsSame = (initialData: TInitialData, paymentMethods: number[] | string[]) =>
    initialData.paymentMethod?.length === paymentMethods.length &&
    initialData.paymentMethod?.sort().every((value, index) => value === paymentMethods.sort()[index]);

const isMinCompletionRateSame = (minCompletionRate: number | string, initialData: TInitialData) =>
    (minCompletionRate?.toString() ?? null) === initialData.minCompletionRate;

const isMinJoinDaysSame = (minJoinDays: number | string, initialData: TInitialData) =>
    (minJoinDays?.toString() ?? null) === initialData.minJoinDays;

const isPreferredCountriesSame = (initialData: TInitialData, preferedCountries: string[]) =>
    initialData?.selectedCountries?.length === preferedCountries.length &&
    initialData?.selectedCountries?.sort().every((value, index) => value === preferedCountries.sort()[index]);

/**
 * Determines whether the form is dirty based on the provided parameters.
 */
export const isFormDirty = (
    initialData: TInitialData,
    paymentMethods: number[] | string[],
    preferredCountries: string[],
    minCompletionRate: number | string,
    minJoinDays: number | string,
    isDirty: boolean,
    rateType: string,
    adRateType: string
) =>
    isPaymentMethodsSame(initialData, paymentMethods) &&
    isMinCompletionRateSame(minCompletionRate, initialData) &&
    isMinJoinDaysSame(minJoinDays, initialData) &&
    isPreferredCountriesSame(initialData, preferredCountries) &&
    !isDirty &&
    rateType === adRateType;
