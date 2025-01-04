import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';

@Injectable()
export class AiIntegrationService {
  editions = [
    {
      edition: 'tiêu chuẩn',
      value: 0,
    },
    {
      edition: 'đặc biệt',
      value: 1,
    },
    {
      edition: 'toàn tập',
      value: 2,
    },
    {
      edition: 'giới hạn',
      value: 3,
    },
  ];

  constructor(private readonly openai: OpenAI) {}

  async analyzeComic(
    info: string,
  ): Promise<{ edition: string; value: number }> {
    const prompt = `
    Dựa trên thông tin sau: ${info} và các phân loại phiên bản truyện tranh:
    
    1. Phiên bản tiêu chuẩn: Phiên bản phổ biến, dễ tìm, bìa mềm hoặc cứng, giá phải chăng, không có tính năng đặc biệt, không đi kèm phụ kiện.
    2. Phiên bản đặc biệt: Bìa khác biệt (ví dụ: bìa cứng, bìa có lớp mạ vàng, hoặc thiết kế đặc biệt), phát hành trong thời gian ngắn, số lượng giới hạn, có thể có giá cao hơn và kèm theo các phụ kiện như poster, bookmark, v.v.
    3. Phiên bản toàn tập: Tập hợp nhiều tập trong một quyển sách, thường có số trang lớn, bìa cứng, kích thước lớn, có thể thêm bài viết, hình ảnh bổ sung hoặc các tài liệu đặc biệt.
    4. Phiên bản giới hạn: Sản xuất số lượng hạn chế, đi kèm vật phẩm đặc biệt như chữ ký tác giả, mô hình, hoặc các phụ kiện giá trị cao. Giá cao hơn phiên bản tiêu chuẩn.
    
    Lưu ý: Trước khi xác định phiên bản, bạn cần loại bỏ thông tin về phiên bản có trên tựa đề. Ví dụ, nếu tựa đề chứa thông tin như "(Phiên bản toàn tập)", bạn phải loại bỏ phần này và chỉ giữ lại phần tựa đề cơ bản. Ví dụ: Tựa đề "Doraemon tập 25 (Phiên bản toàn tập)" sẽ trở thành "Doraemon tập 25".
    
    Sau khi loại bỏ phiên bản có trên tựa đề, hãy xác định phiên bản dựa trên các thông tin như tựa đề mới, bìa, số trang, kích thước, phụ kiện kèm theo và các thuộc tính bổ sung (nếu có).
    
    Nếu xác định được phiên bản từ thông tin này, kết quả trả về phải là "${this.editions.map((edition) => edition.edition).join(', ')}". Còn nếu không xác định được, trả về "không biết".
    
    Lưu ý trả về một chuỗi ký tự viết thường, bằng tiếng việt. Không giải thích thêm.`;

    console.log({ prompt });

    try {
      const response = await this.openai.chat.completions.create({
        model: 'ft:gpt-4o-mini-2024-07-18:comzone:ft:AhN8hVat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 15,
        temperature: 0.1,
      });

      console.log(response);
      console.log('Message: ', response.choices[0].message);

      const result = response.choices[0].message.content.toLowerCase().trim();

      const foundEdition = this.editions.find((edition) =>
        result.includes(edition.edition.toLowerCase()),
      );

      if (foundEdition) return foundEdition;
      else {
        console.log('Undetectable edition!');
        return this.editions.find((e) => e.value === 0);
      }
    } catch (error) {
      console.error('Error while calling OpenAI API:', error.message);
      throw new Error('Unable to process the request.');
    }
  }
}
