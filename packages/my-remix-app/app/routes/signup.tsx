import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from "@conform-to/react";
import { type ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { Form, redirect } from "@remix-run/react";
import { parseWithValibot } from "conform-to-valibot";
import { type ChangeEvent, useState } from "react";

import {
  custom,
  date,
  maxLength,
  nonEmpty,
  nullish,
  number,
  object,
  pipe,
  string,
} from "valibot";
import { ActivityAreaInput } from "~/components/ActivityAreaInput";
import { SelectControlled } from "~/components/SelectControlled";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const submission = parseWithValibot(formData, { schema });

  if (submission.status !== "success") {
    return json({
      success: false,
      message: "error!",
      submission: submission.reply(),
    });
  }

  const apiClient = context.apiClient;
  // const header = new Headers();
  // const userId = await getUserId(request, context);
  // header.append("Cookie", `userId=${request.headers.get("Cookie")}`);

  try {
    /**
     * createのAPIリクエストがなぜか到達せずに400エラーが返ってくる
     * バリデーションを無効化したら、リクエストが到達するようになった
     */
    const res = await apiClient.profiles.create.$post(
      {
        json: {
          name: submission.value.name,
          birthday: submission.value.birthday,
          genderId: submission.value.genderId,
          activityAreaId: submission.value.activityAreaId,
          iconImageUrl: submission.value.iconImageUrl,
          oneWord: submission.value.oneWord,
        },
      },
      {
        headers: {
          Cookie: request.headers.get("Cookie") ?? "",
        },
      },
    );
    /**
     * HTTPエラーが発生していた場合のエラーハンドリング
     */
    console.log(res);
  } catch (_error) {
    return json({
      success: false,
      message: "error!",
      submission: submission.reply(),
    });
  }

  /**
   * TODO
   * 1. フォームデータを受け取る
   * 2. R2へファイルアップロード
   * 3. エラーフィードバック・エラーハンドリング
   * 4. プロフィール登録の永続化
   * 5. コンポーネント分割・リファクタリング
   */

  return redirect("/home");
};

const schema = object({
  name: pipe(string(), nonEmpty(), maxLength(30)),
  birthday: date(),
  genderId: nullish(
    pipe(
      number(),
      custom(
        (value) => value === 0 || value === 1,
        "Value must be either 0 or 1",
      ),
    ),
  ),
  activityAreaId: number(),
  iconImageUrl: nullish(string()),
  oneWord: pipe(string(), nonEmpty(), maxLength(200)),
});

// type ProfileRegistrationFormInput = InferInput<typeof schema>;

// R2へのアップロードをシミュレートする関数
const uploadToR2 = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`https://r2.example.com/${file.name}`);
    }, 1000);
  });
};

export default function Signup() {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [form, fields] = useForm({
    onValidate({ formData }) {
      /**
       * Conform helpers for integrating with Valibot.
       * @see https://www.npmjs.com/package/conform-to-valibot
       */
      return parseWithValibot(formData, {
        schema,
      });
    },
    defaultValue: {
      name: "",
      birthday: "",
      genderId: 0,
      activityAreaId: 0,
      iconImageUrl: "",
      oneWord: "",
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = await uploadToR2(file);
      setImageUrl(url);
    }
  };

  return (
    <>
      <h1>Sign up</h1>
      <Form method="POST" {...getFormProps(form)}>
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              プロフィール登録
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor={fields.name.id}>表示名</Label>
              <Input
                {...getInputProps(fields.name, {
                  type: "text",
                  placeholder: "表示名を入力してください",
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={fields.birthday.id}>生年月日</Label>
              <Input
                {...getInputProps(fields.birthday, { type: "text" })}
                placeholder="yyyy/mm/dd"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={fields.genderId.id}>性別</Label>
              <SelectControlled
                meta={fields.genderId}
                options={[
                  { label: "未選択", value: 0 },
                  { label: "男性", value: 1 },
                  { label: "女性", value: 2 },
                ]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={fields.activityAreaId.id}>
                活動エリア（都道府県）
              </Label>
              <ActivityAreaInput meta={fields.activityAreaId} />
            </div>

            <div className="space-y-2">
              <Label htmlFor={fields.iconImageUrl.id}>プロフィール画像</Label>
              <Input
                id={fields.iconImageUrl.id}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              {imageUrl && (
                <p className="text-sm text-muted-foreground">
                  アップロードされた画像URL: {imageUrl}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={fields.oneWord.id}>ひとこと</Label>
              <Textarea
                {...getTextareaProps(fields.oneWord)}
                placeholder="自己紹介を入力してください"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">登録</Button>
          </CardFooter>
        </Card>
      </Form>
    </>
  );
}
