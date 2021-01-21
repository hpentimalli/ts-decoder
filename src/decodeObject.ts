import { DecodeError } from './decodeError';
import { Decoder } from './decoder';

const isObjectLike = (value: any) => typeof value === 'object' && !Array.isArray(value) && value != null;

export type PropertyDecoderHelper = <F>(name: string, decoder: Decoder<F>) => F;

export const decodeProperty = (source: { [key: string]: any }, entityName: string): PropertyDecoderHelper => (name, decoder) => {
  if (!isObjectLike(source)) {
    throw new DecodeError(`Can't convert source ${entityName} to object`);
  }

  try {
    const value = source[name];
    return decoder(value);
  } catch (e) {
    if (DecodeError.isDecodeError(e)) {
      throw new DecodeError(`Error in ${entityName}.${name}. Data: ${JSON.stringify(source)}`, e);
    }
    throw new DecodeError(`Uknown error in ${entityName}.${name}. }. Data: ${JSON.stringify(source)}. Error: ${e}`);
  }
};

export const decodeObject = <T>(entityName: string, callback: (property: PropertyDecoderHelper) => T): Decoder<T> => input => {
  if (!isObjectLike(input)) {
    throw new DecodeError(`Can't convert input ${entityName} to object`);
  }

  return callback(decodeProperty(input, entityName));
};
