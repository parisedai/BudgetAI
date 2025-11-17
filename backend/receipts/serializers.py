from rest_framework import serializers
from .models import Receipt


class ReceiptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Receipt
        fields = ['id', 'title', 'total_amount', 'raw_text', 'split_between_people', 'created_at']
        read_only_fields = ['id', 'created_at']


class UploadResponseSerializer(serializers.Serializer):
    raw_text = serializers.CharField()
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2)


class SplitRequestSerializer(serializers.Serializer):
    items = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField()
        )
    )
    people = serializers.ListField(
        child=serializers.CharField()
    )


class SplitResponseSerializer(serializers.Serializer):
    split = serializers.DictField()

