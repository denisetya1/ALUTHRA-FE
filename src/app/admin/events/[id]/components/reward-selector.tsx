"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { CardOption, ItemOption } from "@/types/admin-options";
import { FieldError } from "./module-editor-kit";

import { rewardArrayPath } from "@/lib/event-editor-fields";

/**
 * Generic reward selector: works against any field-array path (e.g.
 * `stages.0.first_clear_rewards`, `missions.1.rewards`, `shop_items.0.rewards`).
 * Currency options for `event_currency` come from the event's currencies module.
 */
export function RewardSelector({
  basePath,
  itemOptions,
  cardOptions,
  eventCurrencies,
}: {
  basePath: string;
  itemOptions: ItemOption[];
  cardOptions: CardOption[];
  eventCurrencies: { currency_code: string; name_english: string }[];
}) {
  const { control, register, watch, formState } = useFormContext();
  const path = rewardArrayPath(basePath);
  const { fields, append, remove } = useFieldArray({ control, name: path as never });
  const errors = formState.errors;

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium">Rewards</span>
        <Button type="button" variant="outline" size="sm" onClick={() => append({ type: "crown", quantity: 1 })}>
          <Plus />
          Add reward
        </Button>
      </div>
      {fields.map((field, index) => {
        const type = watch(`${path}.${index}.type`);
        return (
          <div className="grid gap-2" key={field.id}>
            <div className="grid items-end gap-2 md:grid-cols-[minmax(0,150px)_minmax(0,1fr)_minmax(0,120px)_40px]">
              <div className="grid content-start gap-1">
                <Select aria-label="Reward type" {...register(`${path}.${index}.type` as const)}>
                  <option value="crown">Crown</option>
                  <option value="aether">Aether</option>
                  <option value="item">Item</option>
                  <option value="card">Card</option>
                  {eventCurrencies.length ? <option value="event_currency">Event currency</option> : null}
                </Select>
              </div>
              {type === "item" ? (
                <Select aria-label="Item" {...register(`${path}.${index}.item_id` as const)}>
                  <option value="">Select item</option>
                  {itemOptions.map((option) => (
                    <option key={option._id} value={option._id}>
                      {option.name_english || option.name_indonesia || option._id}
                    </option>
                  ))}
                </Select>
              ) : type === "card" ? (
                <Select aria-label="Card" {...register(`${path}.${index}.card_id` as const)}>
                  <option value="">Select card</option>
                  {cardOptions.map((option) => (
                    <option key={option._id} value={option._id}>
                      {option.name || option._id}
                    </option>
                  ))}
                </Select>
              ) : type === "event_currency" ? (
                <Select aria-label="Event currency" {...register(`${path}.${index}.currency_code` as const)}>
                  <option value="">Select currency</option>
                  {eventCurrencies.map((currency) => (
                    <option key={currency.currency_code} value={currency.currency_code}>
                      {currency.name_english} ({currency.currency_code})
                    </option>
                  ))}
                </Select>
              ) : (
                <div />
              )}
              <div className="grid content-start gap-1">
                <Input type="number" min="1" placeholder="Qty" aria-label="Quantity" {...register(`${path}.${index}.quantity` as const, { valueAsNumber: true })} />
              </div>
              <Button type="button" variant="ghost" size="icon" aria-label="Remove reward" onClick={() => remove(index)}>
                <Trash2 />
              </Button>
            </div>
            <FieldError errors={errors} path={`${path}.${index}.quantity`} />
            <FieldError errors={errors} path={`${path}.${index}.item_id`} />
            <FieldError errors={errors} path={`${path}.${index}.card_id`} />
            <FieldError errors={errors} path={`${path}.${index}.currency_code`} />
          </div>
        );
      })}
      <FieldError errors={errors} path={`${path}`} />
    </div>
  );
}
